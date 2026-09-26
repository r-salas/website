//
//
//  Composer
//
//

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/shadcn/button'
import { Textarea } from '@/components/shadcn/textarea'


function Composer({ onSend, disabled }: { onSend: (text: string) => void, disabled?: boolean }) {
    const { t } = useTranslation()
    const [value, setValue] = useState('')
    const canSend = value.trim().length > 0 && !disabled

    const submit = () => {
        if (!canSend) return
        onSend(value)
        setValue('')
    }

    return <form
        onSubmit={event => {
            event.preventDefault()
            submit()
        }}
        className="shrink-0 border-t p-3"
    >
        <div className="bg-background focus-within:border-ring focus-within:ring-ring/50 flex items-end gap-2 rounded-xl border p-1.5 pl-3 transition-colors focus-within:ring-3 dark:bg-input/30">
            <Textarea
                value={value}
                onChange={event => setValue(event.target.value)}
                onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault()
                        submit()
                    }
                }}
                rows={1}
                placeholder={t('chat.composer.placeholder')}
                aria-label={t('chat.composer.placeholder')}
                className="max-h-40 min-h-0 resize-none border-0 bg-transparent px-0 py-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
            <Button
                type="submit"
                size="icon"
                disabled={!canSend}
                aria-label={t('chat.composer.send')}
                className="rounded-lg"
            >
                <ArrowUp />
            </Button>
        </div>
    </form>
}

export default Composer
