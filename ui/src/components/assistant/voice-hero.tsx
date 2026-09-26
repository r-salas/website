//
//
//  VoiceHero
//
//

import { cn } from 'cn'
import { useTranslation } from 'react-i18next'
import { Mic, PhoneOff } from 'lucide-react'
import { Button } from '@/components/shadcn/button'
import VoiceOrb from '@/components/assistant/voice-orb'
import type { VoiceStatus } from '@/hooks/use-assistant'


function VoiceHero({ status, onStart, onStop }: {
    status: VoiceStatus
    onStart: () => void
    onStop: () => void
}) {
    const { t } = useTranslation()
    const active = status !== 'idle'
    const toggle = active ? onStop : onStart

    return <section className="flex flex-col items-center gap-6 px-6 py-8 text-center">
        <button
            type="button"
            onClick={toggle}
            aria-label={active ? t('chat.voice.end') : t('chat.voice.speakNow')}
            className="group rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        >
            <VoiceOrb
                status={status}
                className="size-32 transition-transform duration-300 group-hover:scale-[1.03] group-active:scale-[0.98] sm:size-40"
            />
        </button>

        <div className="flex flex-col items-center gap-3">
            <Button
                size="lg"
                variant={active ? 'outline' : 'default'}
                className="h-10 rounded-full px-5 text-sm"
                onClick={toggle}
                tabIndex={-1}
                aria-hidden
            >
                {active ? <PhoneOff /> : <Mic />}
                {active ? t('chat.voice.end') : t('chat.voice.speakNow')}
            </Button>
            <StatusLine status={status} className="text-sm" />
        </div>
    </section>
}


function StatusLine({ status, className }: { status: VoiceStatus, className?: string }) {
    const { t } = useTranslation()

    return <p aria-live="polite" className={cn('text-muted-foreground flex items-center gap-1.5 truncate', className)}>
        {status !== 'idle' && <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inset-0 animate-ping rounded-full bg-(--orb-1) opacity-75 motion-reduce:hidden" />
            <span className="relative size-1.5 rounded-full bg-(--orb-1)" />
        </span>}
        {t(`chat.voice.status.${status}`)}
    </p>
}

export default VoiceHero
