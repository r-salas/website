import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {i18n} from "@lingui/core"
import {I18nProvider} from "@lingui/react"
import './index.css'
import {messages as enMessages} from "./locales/en"
import {messages as esMessages} from "./locales/es"
import {detect, fromNavigator} from "@lingui/detect-locale";
import {normalizeLocale} from "./utils.ts";

i18n.load({
    en: enMessages,
    es: esMessages,
})

const defaultLocale = "en"
const browserLocale = detect(fromNavigator(), defaultLocale) || defaultLocale
const normalizedLocale = normalizeLocale(browserLocale)
i18n.activate(normalizedLocale)

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <I18nProvider i18n={i18n}>
            <App />
        </I18nProvider>
    </React.StrictMode>,
)
