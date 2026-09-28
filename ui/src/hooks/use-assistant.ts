//
//
//  useAssistant
//
//
//  Text chat is wired to the `/chat` API (OpenRouter, streamed as plain text).
//  Voice runs on the Gemini Live API: `/voice/token` mints an ephemeral token
//  and the browser streams audio to Gemini directly. Voice transcripts land in
//  the same message list as the text chat.
//

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LiveSession, type LiveToken } from '@/lib/gemini-live'

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking'
export type VoiceError = 'micDenied' | 'unavailable'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}


export function useAssistant() {
    const { t, i18n } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
    const [voiceError, setVoiceError] = useState<VoiceError | null>(null)
    const abortRef = useRef<AbortController | undefined>(undefined)
    const sessionRef = useRef<LiveSession | undefined>(undefined)
    // Messages being filled in by the current voice turn's transcripts.
    const voiceTurnRef = useRef<{ userId?: string, assistantId?: string }>({})

    useEffect(() => () => {
        abortRef.current?.abort()
        sessionRef.current?.stop()
    }, [])

    const sendMessage = async (content: string) => {
        const text = content.trim()
        if (!text || isThinking) return

        // While on a call, typed messages go to the live session instead of the text chat.
        const session = sessionRef.current
        if (session?.isReady) {
            voiceTurnRef.current = {}
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }])
            session.sendText(text)
            return
        }

        const history = [...messages, { id: crypto.randomUUID(), role: 'user' as const, content: text }]
        setMessages(history)
        setIsThinking(true)

        const assistantId = crypto.randomUUID()
        let hasReply = false

        const controller = new AbortController()
        abortRef.current = controller

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    messages: history.map(({ role, content }) => ({ role, content })),
                }),
            })

            if (!response.ok || !response.body) throw new Error(`Chat request failed (${response.status})`)

            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            for (;;) {
                const { value, done } = await reader.read()
                if (done) break

                const delta = decoder.decode(value, { stream: true })
                if (!delta) continue

                if (!hasReply) {
                    hasReply = true
                    setIsThinking(false)
                    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: delta }])
                } else {
                    setMessages(prev => prev.map(message =>
                        message.id === assistantId ? { ...message, content: message.content + delta } : message,
                    ))
                }
            }

            if (!hasReply) throw new Error('Empty chat response')
        } catch {
            if (controller.signal.aborted) return

            setMessages(prev => hasReply
                ? prev
                : [...prev, { id: assistantId, role: 'assistant', content: t('chat.error') }])
        } finally {
            setIsThinking(false)
        }
    }

    const appendTranscript = (role: Message['role'], delta: string) => {
        const turn = voiceTurnRef.current
        const id = role === 'user' ? turn.userId : turn.assistantId

        if (id) {
            setMessages(prev => prev.map(message =>
                message.id === id ? { ...message, content: message.content + delta } : message,
            ))
            return
        }

        const content = delta.trimStart()
        if (!content) return

        const message: Message = { id: crypto.randomUUID(), role, content }
        if (role === 'assistant') {
            turn.assistantId = message.id
            setMessages(prev => [...prev, message])
            return
        }

        // Input transcripts have no guaranteed ordering, so keep them above the reply they prompted.
        turn.userId = message.id
        const replyId = turn.assistantId
        setMessages(prev => {
            const index = replyId ? prev.findIndex(({ id }) => id === replyId) : -1
            return index === -1 ? [...prev, message] : [...prev.slice(0, index), message, ...prev.slice(index)]
        })
    }

    const startVoice = () => {
        if (voiceStatus !== 'idle') return
        setVoiceStatus('connecting')
        setVoiceError(null)
        voiceTurnRef.current = {}

        const history = messages.map(({ role, content }) => ({ role, content }))
        const isCurrent = (): boolean => sessionRef.current === session

        const session = new LiveSession({
            onReady: () => isCurrent() && setVoiceStatus('listening'),
            onSpeakingChange: speaking => isCurrent() && setVoiceStatus(speaking ? 'speaking' : 'listening'),
            onTranscript: (role, delta) => isCurrent() && appendTranscript(role, delta),
            onTurnComplete: () => {
                if (isCurrent()) voiceTurnRef.current = {}
            },
            onClose: reason => {
                if (!isCurrent()) return
                sessionRef.current = undefined
                setVoiceStatus('idle')
                if (reason !== 'ended') setVoiceError(reason)
            },
        }, { greet: history.length === 0 })
        sessionRef.current = session

        void session.start(async (): Promise<LiveToken> => {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/voice/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, language: i18n.resolvedLanguage }),
            })
            if (!response.ok) throw new Error(`Voice token request failed (${response.status})`)
            return response.json()
        })
    }

    const stopVoice = () => {
        sessionRef.current?.stop()
        sessionRef.current = undefined
        setVoiceStatus('idle')
    }

    const dismissVoiceError = () => setVoiceError(null)

    return { messages, isThinking, sendMessage, voiceStatus, voiceError, startVoice, stopVoice, dismissVoiceError }
}
