//
//
//  ChatPanel
//
//

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/shadcn/card'
import { Button } from '@/components/shadcn/button'
import VoiceHero from '@/components/assistant/voice-hero'
import VoiceControl from '@/components/assistant/voice-control'
import VoiceComingSoonDialog from '@/components/assistant/voice-coming-soon-dialog'
import MessageList from '@/components/assistant/message-list'
import Composer from '@/components/assistant/composer'
import { useAssistant } from '@/hooks/use-assistant'

const suggestions = ['experience', 'voice', 'stack'] as const


function ChatPanel() {
    const { t } = useTranslation()
    const { messages, isThinking, sendMessage, voiceStatus, stopVoice } = useAssistant()
    const hasConversation = messages.length > 0
    // Voice mode has no backend yet — let visitors know instead of faking a connection.
    const [voiceComingSoonOpen, setVoiceComingSoonOpen] = useState(false)
    const promptVoice = () => setVoiceComingSoonOpen(true)

    return <Card className="flex h-[80svh] min-h-[560px] flex-col gap-0 overflow-hidden py-0 lg:h-full lg:min-h-0">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4">
            <div className="flex min-w-0 flex-col">
                <h2 className="text-sm font-medium">{t('chat.title')}</h2>
                <p className="text-muted-foreground truncate text-xs">{t('chat.subtitle')}</p>
            </div>

            {hasConversation && <VoiceControl status={voiceStatus} onStart={promptVoice} onStop={stopVoice} />}
        </header>

        <VoiceComingSoonDialog open={voiceComingSoonOpen} onOpenChange={setVoiceComingSoonOpen} />

        {hasConversation
            ? <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                <MessageList messages={messages} isThinking={isThinking} />
            </div>
            : <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto">
                <VoiceHero status={voiceStatus} onStart={promptVoice} onStop={stopVoice} />

                <div className="flex w-full max-w-md flex-col items-center gap-3 px-6 pb-6">
                    <div className="text-muted-foreground flex w-full items-center gap-3 text-xs">
                        <span className="bg-border h-px flex-1" />
                        {t('chat.orType')}
                        <span className="bg-border h-px flex-1" />
                    </div>

                    <ul className="flex flex-wrap justify-center gap-2">
                        {suggestions.map(key => <li key={key}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-auto rounded-full px-3 py-1.5 text-left whitespace-normal"
                                onClick={() => sendMessage(t(`chat.suggestions.${key}`))}
                            >
                                {t(`chat.suggestions.${key}`)}
                            </Button>
                        </li>)}
                    </ul>
                </div>
            </div>}

        <Composer onSend={sendMessage} disabled={isThinking} />
    </Card>
}

export default ChatPanel
