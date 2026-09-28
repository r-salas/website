//
//
//  VoiceComingSoonDialog
//
//  Voice mode isn't wired to a backend yet; let visitors know instead of
//  faking a connection.
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

function VoiceComingSoonDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { t } = useTranslation()

    return <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{t('chat.voice.comingSoon.title')}</DialogTitle>
                <DialogDescription>{t('chat.voice.comingSoon.description')}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={() => onOpenChange(false)}>{t('chat.voice.comingSoon.dismiss')}</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
}

export default VoiceComingSoonDialog
