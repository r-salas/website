//
//
//  useAssistant
//
//
//  Text chat is wired to the `/chat` API (OpenRouter, streamed as plain text).
//  Voice is still a local mock — swap the bodies of `startVoice`/`stopVoice`
//  once the realtime voice backend is ready; the UI only depends on the
//  returned shape.
//

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

export type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'speaking'

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
}


export function useAssistant() {
    const { t } = useTranslation()
    const [messages, setMessages] = useState<Message[]>([])
    const [isThinking, setIsThinking] = useState(false)
    const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle')
    const voiceTimer = useRef<number | undefined>(undefined)
    const abortRef = useRef<AbortController | undefined>(undefined)

    useEffect(() => () => {
        clearTimeout(voiceTimer.current)
        abortRef.current?.abort()
    }, [])

    const sendMessage = async (content: string) => {
        const text = content.trim()
        if (!text || isThinking) return

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

    const startVoice = () => {
        if (voiceStatus !== 'idle') return
        setVoiceStatus('connecting')

        // TODO: replace with realtime voice session
        voiceTimer.current = window.setTimeout(() => setVoiceStatus('listening'), 900)
    }

    const stopVoice = () => {
        clearTimeout(voiceTimer.current)
        setVoiceStatus('idle')
    }

    return { messages, isThinking, sendMessage, voiceStatus, startVoice, stopVoice }
}
