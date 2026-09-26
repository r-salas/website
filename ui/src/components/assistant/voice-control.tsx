//
//
//  VoiceControl
//
//  Compact voice toggle for the chat header.
//

import { useTranslation } from 'react-i18next'
import { PhoneOff } from 'lucide-react'
import { Button } from '@/components/shadcn/button'
import VoiceOrb from '@/components/assistant/voice-orb'
import type { VoiceStatus } from '@/hooks/use-assistant'


function VoiceControl({ status, onStart, onStop }: {
    status: VoiceStatus
    onStart: () => void
    onStop: () => void
}) {
    const { t } = useTranslation()

    if (status === 'idle') {
        return <Button variant="outline" className="rounded-full pr-3 pl-1" onClick={onStart}>
            <VoiceOrb glow={false} className="size-6" />
            {t('chat.voice.speakNow')}
        </Button>
    }

    return <div className="flex h-8 items-center gap-2 rounded-full bg-[linear-gradient(90deg,color-mix(in_oklch,var(--orb-1)_14%,transparent),color-mix(in_oklch,var(--orb-3)_10%,transparent))] py-1 pr-0.5 pl-1 ring-1 ring-(--orb-1)/25 ring-inset">
        <VoiceOrb status={status} glow={false} className="size-6" />
        <span aria-live="polite" className="text-xs font-medium">
            {t(`chat.voice.status.${status}`)}
        </span>
        <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full hover:bg-(--orb-1)/15"
            onClick={onStop}
            aria-label={t('chat.voice.end')}
        >
            <PhoneOff />
        </Button>
    </div>
}

export default VoiceControl
