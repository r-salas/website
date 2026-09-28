//
//
//  MessageList
//
//

import { cn } from 'cn'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import avatarImage from '@/assets/avatar.jpg'
import { Avatar, AvatarImage } from '@/components/shadcn/avatar'
import Markdown from '@/components/assistant/markdown'
import type { Message } from '@/hooks/use-assistant'


function MessageList({ messages, isThinking }: { messages: Message[], isThinking: boolean }) {
    const { t } = useTranslation()
    const endRef = useRef<HTMLLIElement>(null)
    // Streamed replies grow `content` in place without changing `messages.length`,
    // so track total text length too or we'd only scroll once per message.
    const contentLength = messages.reduce((total, message) => total + message.content.length, 0)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, [messages.length, contentLength, isThinking])

    return <ol aria-label={t('chat.title')} aria-live="polite" className="flex flex-col gap-4">
        {messages.map(message => <li key={message.id}>
            <Bubble role={message.role}>
                {message.role === 'assistant' ? <Markdown>{message.content}</Markdown> : message.content}
            </Bubble>
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
            <AvatarImage src={avatarImage} alt="" className="object-top" />
        </Avatar>}

        <div className={cn(
            'max-w-[85%] rounded-2xl px-3.5 py-2 text-[0.9375rem] leading-relaxed break-words sm:max-w-[75%]',
            isUser
                ? 'whitespace-pre-wrap bg-primary text-primary-foreground rounded-br-md'
                : 'bg-muted rounded-bl-md',
        )}>
            {children}
        </div>
    </div>
}

export default MessageList
