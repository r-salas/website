//
//
//  i18n
//
//

import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import es from './locales/es'

export const resources = {
    en: { translation: en },
    es: { translation: es },
} as const

i18n.on('languageChanged', lng => {
    document.documentElement.lang = lng
})

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: Object.keys(resources),
        nonExplicitSupportedLngs: true,
        load: 'languageOnly',
        interpolation: { escapeValue: false },
        detection: {
            order: ['navigator'],
            caches: [],
        },
    })

export default i18n
