//
//
//  VoiceOrb
//
//

import { cn } from 'cn'
import type { VoiceStatus } from '@/hooks/use-assistant'

const gradient = 'bg-[conic-gradient(from_0deg,var(--orb-1),var(--orb-2),var(--orb-3),var(--orb-1))]'

const spinSpeed: Record<VoiceStatus, string> = {
    idle: '[animation-duration:12s]',
    connecting: '[animation-duration:2s]',
    listening: '[animation-duration:6s]',
    speaking: '[animation-duration:3s]',
}


function VoiceOrb({ status = 'idle', glow = true, className }: {
    status?: VoiceStatus
    glow?: boolean
    className?: string
}) {
    const active = status !== 'idle'

    return <span
        data-state={status}
        aria-hidden
        className={cn('relative isolate inline-grid size-32 shrink-0 place-items-center rounded-full', className)}
    >
        {glow && status === 'listening' && <>
            <span className="absolute inset-0 rounded-full bg-(--orb-2)/40 animate-orb-ripple motion-reduce:hidden" />
            <span className="absolute inset-0 rounded-full bg-(--orb-1)/30 animate-orb-ripple [animation-delay:1.2s] motion-reduce:hidden" />
        </>}

        {/* Glow */}
        {glow && <span className={cn(
            'absolute -inset-[12%] -z-10 rounded-full blur-xl transition-opacity duration-500 animate-orb-spin motion-reduce:animate-none',
            gradient,
            spinSpeed[status],
            active ? 'opacity-70' : 'opacity-35',
        )} />}

        {/* Sphere */}
        <span className={cn(
            'absolute inset-0 overflow-hidden rounded-full animate-orb-breathe motion-reduce:animate-none',
            status === 'speaking' && '[animation-duration:1.2s]',
        )}>
            <span className={cn('absolute -inset-1/4 blur-md animate-orb-spin motion-reduce:animate-none', gradient, spinSpeed[status])} />
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgb(255_255_255/0.85),transparent_42%)]" />
            <span className="absolute inset-0 rounded-full shadow-[inset_0_-10px_28px_rgb(0_0_0/0.28),inset_0_2px_6px_rgb(255_255_255/0.5)]" />
        </span>
    </span>
}

export default VoiceOrb
