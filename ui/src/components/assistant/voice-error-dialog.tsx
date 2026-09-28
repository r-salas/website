//
//
//  VoiceErrorDialog
//
//  Explains why a voice session couldn't start (or dropped) and points
//  visitors to the text chat instead.
//

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/shadcn/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/shadcn/dialog'
import type { VoiceError } from '@/hooks/use-assistant'

function VoiceErrorDialog({ error, onDismiss }: { error: VoiceError | null, onDismiss: () => void }) {
    const { t } = useTranslation()

    return <Dialog open={error !== null} onOpenChange={open => !open && onDismiss()}>
        {error && <DialogContent>
            <DialogHeader>
                <DialogTitle>{t(`chat.voice.error.${error}.title`)}</DialogTitle>
                <DialogDescription>{t(`chat.voice.error.${error}.description`)}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={onDismiss}>{t('chat.voice.error.dismiss')}</Button>
            </DialogFooter>
        </DialogContent>}
    </Dialog>
}

export default VoiceErrorDialog
