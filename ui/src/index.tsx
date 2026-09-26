import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import { TooltipProvider } from '@/components/shadcn/tooltip'
import App from './App.tsx'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TooltipProvider>
            <App />
        </TooltipProvider>
    </StrictMode>,
)
