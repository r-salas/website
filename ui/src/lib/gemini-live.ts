//
//
//  Gemini Live
//
//
//  Minimal browser client for the Gemini Live API over raw WebSockets: streams
//  microphone PCM up, plays the model's 24kHz PCM reply and surfaces
//  transcripts. Authenticates with a single-use ephemeral token minted by our
//  API, which also locks the whole session setup server-side.
//

const WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained'

// Sent as the first message so the assistant speaks first (only when `greet` is set).
const GREETING_TRIGGER = 'The visitor just started a voice call. Greet them in one short sentence and ask how you can help.'

const OUTPUT_SAMPLE_RATE = 24000
// Gemini recommends sending audio in 20-40ms chunks.
const INPUT_CHUNK_SECONDS = 0.032

// Worklets are inlined so they don't need a separate build/serve step.
const CAPTURE_WORKLET = `
class LiveCapture extends AudioWorkletProcessor {
    constructor(options) {
        super()
        this.buffer = new Float32Array(options.processorOptions.chunkSize)
        this.index = 0
    }

    process(inputs) {
        const channel = inputs[0] && inputs[0][0]
        if (!channel) return true

        for (let i = 0; i < channel.length; i++) {
            this.buffer[this.index++] = channel[i]
            if (this.index < this.buffer.length) continue

            const pcm = new Int16Array(this.buffer.length)
            for (let j = 0; j < pcm.length; j++) {
                const sample = Math.max(-1, Math.min(1, this.buffer[j]))
                pcm[j] = sample < 0 ? sample * 0x8000 : sample * 0x7fff
            }
            this.port.postMessage(pcm.buffer, [pcm.buffer])
            this.index = 0
        }
        return true
    }
}
registerProcessor('live-capture', LiveCapture)
`

const PLAYBACK_WORKLET = `
class LivePlayback extends AudioWorkletProcessor {
    constructor() {
        super()
        this.queue = []
        this.offset = 0
        this.port.onmessage = ({ data }) => {
            if (data === 'clear') {
                this.queue = []
                this.offset = 0
            } else {
                this.queue.push(data)
            }
        }
    }

    process(inputs, outputs) {
        const channel = outputs[0][0]
        const hadAudio = this.queue.length > 0
        let written = 0

        while (written < channel.length && this.queue.length > 0) {
            const chunk = this.queue[0]
            const count = Math.min(channel.length - written, chunk.length - this.offset)
            channel.set(chunk.subarray(this.offset, this.offset + count), written)
            written += count
            this.offset += count
            if (this.offset >= chunk.length) {
                this.queue.shift()
                this.offset = 0
            }
        }
        channel.fill(0, written)

        if (hadAudio && this.queue.length === 0) this.port.postMessage('drained')
        return true
    }
}
registerProcessor('live-playback', LivePlayback)
`

export type LiveCloseReason = 'ended' | 'micDenied' | 'unavailable'

export interface LiveToken {
    token: string
    model: string
}

export interface LiveCallbacks {
    onReady: () => void
    onSpeakingChange: (speaking: boolean) => void
    // Incremental transcript chunks, to be appended to the current turn.
    onTranscript: (role: 'user' | 'assistant', delta: string) => void
    // The model finished (or was interrupted in) its turn.
    onTurnComplete: () => void
    // Not called when the session is ended through `stop()`.
    onClose: (reason: LiveCloseReason) => void
}

interface ServerMessage {
    setupComplete?: object
    serverContent?: {
        modelTurn?: { parts?: { inlineData?: { data?: string } }[] }
        inputTranscription?: { text?: string }
        outputTranscription?: { text?: string }
        interrupted?: boolean
        turnComplete?: boolean
    }
}


function workletUrl(source: string) {
    return URL.createObjectURL(new Blob([source], { type: 'application/javascript' }))
}

function toBase64(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
}

// Little-endian 16-bit PCM (base64) -> Float32 samples in [-1, 1).
function pcm16ToFloat32(base64: string) {
    const binary = atob(base64)
    const samples = new Float32Array(binary.length >> 1)
    for (let i = 0; i < samples.length; i++) {
        const value = binary.charCodeAt(2 * i) | (binary.charCodeAt(2 * i + 1) << 8)
        samples[i] = (value >= 0x8000 ? value - 0x10000 : value) / 0x8000
    }
    return samples
}


export class LiveSession {
    private readonly callbacks: LiveCallbacks
    private readonly greet: boolean
    // Created up front, inside the user gesture, so browsers let it start playing.
    private readonly playbackContext = new AudioContext({ sampleRate: OUTPUT_SAMPLE_RATE })
    // Created only once the mic is open: Chrome feeds silence to a context created before that.
    private captureContext?: AudioContext
    private socket?: WebSocket
    private stream?: MediaStream
    // Held on the instance so the audio graph isn't garbage-collected mid-call.
    private source?: MediaStreamAudioSourceNode
    private capture?: AudioWorkletNode
    private playback?: AudioWorkletNode
    private ready = false
    private closed = false
    private speaking = false
    private playbackActive = false
    private turnDone = true

    constructor(callbacks: LiveCallbacks, { greet = true }: { greet?: boolean } = {}) {
        this.callbacks = callbacks
        this.greet = greet
    }

    get isReady() {
        return this.ready
    }

    async start(getToken: () => Promise<LiveToken>) {
        let token: LiveToken
        try {
            const [liveToken, stream] = await Promise.all([
                getToken(),
                navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
                }).then(stream => {
                    this.stream = stream
                    // The session may have failed or been stopped while waiting for permission.
                    if (this.closed) stream.getTracks().forEach(track => track.stop())
                    return stream
                }, (error: unknown) => {
                    throw error instanceof DOMException && error.name === 'NotAllowedError' ? 'micDenied' : error
                }),
            ])
            token = liveToken
            if (this.closed) return this.release()

            await this.setupAudio(stream)
            if (this.closed) return this.release()
        } catch (error) {
            return this.fail(error === 'micDenied' ? 'micDenied' : 'unavailable')
        }

        const socket = new WebSocket(`${WS_URL}?access_token=${encodeURIComponent(token.token)}`)
        this.socket = socket

        // The token already locks the full setup; the setup message is still required to start.
        socket.onopen = () => this.send({ setup: { model: token.model } })
        socket.onmessage = event => void this.handleMessage(event)
        socket.onclose = event => this.fail(event.code === 1000 && this.ready ? 'ended' : 'unavailable')
    }

    sendText(text: string) {
        if (this.ready) this.send({ realtimeInput: { text } })
    }

    stop() {
        if (this.closed) return
        this.closed = true
        this.release()
    }

    private async setupAudio(stream: MediaStream) {
        // Match the mic's own rate (mixing rates breaks in Firefox); Gemini resamples whatever we send.
        const micRate = stream.getAudioTracks()[0]?.getSettings().sampleRate
        const captureContext = new AudioContext(micRate ? { sampleRate: micRate } : undefined)
        this.captureContext = captureContext

        const captureUrl = workletUrl(CAPTURE_WORKLET)
        const playbackUrl = workletUrl(PLAYBACK_WORKLET)
        try {
            await Promise.all([
                captureContext.audioWorklet.addModule(captureUrl),
                this.playbackContext.audioWorklet.addModule(playbackUrl),
                captureContext.resume(),
                this.playbackContext.resume(),
            ])
        } finally {
            URL.revokeObjectURL(captureUrl)
            URL.revokeObjectURL(playbackUrl)
        }

        const { sampleRate } = captureContext
        this.capture = new AudioWorkletNode(captureContext, 'live-capture', {
            processorOptions: { chunkSize: Math.round(sampleRate * INPUT_CHUNK_SECONDS) },
        })
        this.capture.port.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
            if (!this.ready) return
            this.send({ realtimeInput: { audio: { data: toBase64(data), mimeType: `audio/pcm;rate=${sampleRate}` } } })
        }
        this.source = captureContext.createMediaStreamSource(stream)
        this.source.connect(this.capture)
        // Some browsers only process nodes that reach the destination; the worklet outputs silence.
        this.capture.connect(captureContext.destination)

        this.playback = new AudioWorkletNode(this.playbackContext, 'live-playback')
        this.playback.port.onmessage = () => {
            this.playbackActive = false
            if (this.turnDone) this.setSpeaking(false)
        }
        this.playback.connect(this.playbackContext.destination)
    }

    private async handleMessage(event: MessageEvent<string | Blob>) {
        let message: ServerMessage
        try {
            message = JSON.parse(typeof event.data === 'string' ? event.data : await event.data.text())
        } catch {
            return
        }
        if (this.closed) return

        if (message.setupComplete) {
            this.ready = true
            if (this.greet) this.send({ realtimeInput: { text: GREETING_TRIGGER } })
            this.callbacks.onReady()
            return
        }

        const content = message.serverContent
        if (!content) return

        for (const part of content.modelTurn?.parts ?? []) {
            if (!part.inlineData?.data) continue
            this.turnDone = false
            this.playbackActive = true
            this.playback?.port.postMessage(pcm16ToFloat32(part.inlineData.data))
            this.setSpeaking(true)
        }

        if (content.inputTranscription?.text) this.callbacks.onTranscript('user', content.inputTranscription.text)
        if (content.outputTranscription?.text) this.callbacks.onTranscript('assistant', content.outputTranscription.text)

        if (content.interrupted) {
            // The visitor barged in: drop whatever is still queued for playback.
            this.playback?.port.postMessage('clear')
            this.playbackActive = false
        }

        if (content.turnComplete || content.interrupted) {
            this.turnDone = true
            if (!this.playbackActive) this.setSpeaking(false)
        }
        if (content.turnComplete) this.callbacks.onTurnComplete()
    }

    private send(message: object) {
        if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message))
    }

    private setSpeaking(speaking: boolean) {
        if (speaking === this.speaking) return
        this.speaking = speaking
        this.callbacks.onSpeakingChange(speaking)
    }

    private fail(reason: LiveCloseReason) {
        if (this.closed) return
        this.closed = true
        this.release()
        this.callbacks.onClose(reason)
    }

    private release() {
        this.ready = false
        if (this.socket) {
            this.socket.onopen = null
            this.socket.onclose = null
            this.socket.onmessage = null
            if (this.socket.readyState <= WebSocket.OPEN) this.socket.close(1000)
        }
        this.stream?.getTracks().forEach(track => track.stop())
        if (this.captureContext && this.captureContext.state !== 'closed') void this.captureContext.close()
        if (this.playbackContext.state !== 'closed') void this.playbackContext.close()
    }
}
