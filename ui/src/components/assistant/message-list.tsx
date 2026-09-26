//
//
//  MessageList
//
//

import { cn } from 'cn'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarImage } from '@/components/shadcn/avatar'
import type { Message } from '@/hooks/use-assistant'


function MessageList({ messages, isThinking }: { messages: Message[], isThinking: boolean }) {
    const { t } = useTranslation()
    const endRef = useRef<HTMLLIElement>(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages.length, isThinking])

    return <ol aria-label={t('chat.title')} aria-live="polite" className="flex flex-col gap-4">
        {messages.map(message => <li key={message.id}>
            <Bubble role={message.role}>{message.content}</Bubble>
        </li>)}

        {isThinking && <li>
            <Bubble role="assistant">
                <span className="flex h-5 items-center gap-1" aria-label={t('chat.thinking')}>
                    {[0, 150, 300].map(delay => <span
                        key={delay}
                        style={{ animationDelay: `${delay}ms` }}
                        className="bg-muted-foreground/60 size-1.5 animate-bounce rounded-full"
                    />)}
                </span>
            </Bubble>
        </li>}

        <li ref={endRef} aria-hidden />
    </ol>
}


function Bubble({ role, children }: { role: Message['role'], children: React.ReactNode }) {
    const isUser = role === 'user'

    return <div className={cn('flex items-end gap-2', isUser && 'justify-end')}>
        {!isUser && <Avatar className="size-7 shrink-0">
            <AvatarImage src={`${import.meta.env.VITE_API_URL}/avatar.webp`} alt="" className="object-top" />
        </Avatar>}

        <div className={cn(
            'max-w-[85%] rounded-2xl px-3.5 py-2 text-[0.9375rem] leading-relaxed whitespace-pre-wrap break-words sm:max-w-[75%]',
            isUser
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted rounded-bl-md',
        )}>
            {children}
        </div>
    </div>
}

export default MessageList
