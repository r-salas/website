//
//
//  useAssistant
//
//
//  Local mock of the assistant API. Swap the bodies of `sendMessage`,
//  `startVoice` and `stopVoice` once the backend is ready; the UI only
//  depends on the returned shape.
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
    const replyTimer = useRef<number | undefined>(undefined)
    const voiceTimer = useRef<number | undefined>(undefined)

    useEffect(() => () => {
        clearTimeout(replyTimer.current)
        clearTimeout(voiceTimer.current)
    }, [])

    const sendMessage = (content: string) => {
        const text = content.trim()
        if (!text || isThinking) return

        setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }])
        setIsThinking(true)

        // TODO: replace with API call
        replyTimer.current = window.setTimeout(() => {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: t('chat.pendingReply'),
            }])
            setIsThinking(false)
        }, 900)
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
