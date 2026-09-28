//
//
//  ProfilePanel
//
//

import {cn} from "cn"
import { useTranslation } from 'react-i18next'
import { ChevronDown, Download, Mail } from 'lucide-react'
import avatarImage from '@/assets/avatar.jpg'
import { GithubIcon, LinkedinIcon } from '@/components/brand-icons'
import { Avatar, AvatarImage } from '@/components/shadcn/avatar'
import { Button, buttonVariants } from '@/components/shadcn/button'
import { Card, CardContent } from '@/components/shadcn/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/shadcn/collapsible'
import { Separator } from '@/components/shadcn/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/shadcn/tooltip'


function ProfilePanel() {
    const { t } = useTranslation()

    return <Card className="gap-0 py-0 lg:sticky lg:top-0 lg:max-h-full">
        <CardContent className="flex flex-col gap-5 p-5 lg:min-h-0">
            <header className="flex items-center gap-4 lg:min-h-0 lg:flex-col lg:items-start">
                <Avatar className="size-auto w-24 aspect-[1021/995] shrink-0 lg:aspect-auto lg:h-[292px] lg:min-h-40 lg:w-full lg:shrink rounded-lg after:rounded-lg">
                    <AvatarImage src={avatarImage} alt="Rubén Salas" className="aspect-auto rounded-lg object-top" />
                </Avatar>

                <div className="flex min-w-0 flex-col gap-1">
                    <h1 className="text-xl lg:text-2xl leading-tight font-semibold tracking-tight">
                        Rubén Salas
                    </h1>
                    <p className="text-muted-foreground text-sm">{t('profile.role')}</p>
                </div>
            </header>

            <p className="text-[0.9375rem] leading-relaxed">{t('profile.tagline')}</p>

            <div className="flex flex-col gap-2">
                <a
                    href={`${import.meta.env.VITE_API_URL}/Ruben_Salas_ML_Engineer_CV.pdf`}
                    download
                    className={cn(buttonVariants(), 'w-full')}
                >
                    <Download />
                    {t('profile.downloadResume')}
                </a>

                <a
                    href={`mailto:ruben.sls@outlook.com?subject=${encodeURIComponent(t('profile.emailSubject'))}`}
                    className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
                >
                    <Mail />
                    {t('profile.getInTouch')}
                </a>
            </div>

            <Facts className="hidden lg:flex" />

            {/* Mobile: keep the fold short, details on demand */}
            <Collapsible className="lg:hidden">
                <CollapsibleTrigger render={
                    <Button variant="ghost" size="sm" className="group w-full justify-between px-2" />
                }>
                    {t('profile.moreAboutMe')}
                    <ChevronDown className="transition-transform group-data-[panel-open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <Facts className="pt-3" />
                </CollapsibleContent>
            </Collapsible>

            <Separator />

            <div className="flex items-center justify-between">
                <nav className="flex items-center gap-1">
                    <IconLink href="https://github.com/r-salas" label="GitHub"><GithubIcon /></IconLink>
                    <IconLink href="https://linkedin.com/in/you" label="LinkedIn"><LinkedinIcon /></IconLink>
                </nav>
                <span className="text-muted-foreground text-xs">{t('profile.location')}</span>
            </div>
        </CardContent>
    </Card>
}


function Facts({ className }: { className?: string }) {
    const { t } = useTranslation()

    return <dl className={`flex flex-col gap-3 ${className ?? ''}`}>
        {(['experience', 'currently', 'focus', 'stack'] as const).map(fact => <div key={fact} className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {t(`profile.facts.${fact}.label`)}
            </dt>
            <dd className="text-sm">{t(`profile.facts.${fact}.value`)}</dd>
        </div>)}
    </dl>
}


function IconLink({ href, label, children }: {
    href: string
    label: string
    children: React.ReactNode
}) {
    return <Tooltip>
        <TooltipTrigger render={
            <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className={buttonVariants({ variant: 'ghost', size: 'icon' })}
            />
        }>
            {children}
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
}

export default ProfilePanel
