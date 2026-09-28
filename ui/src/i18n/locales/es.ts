//
//
//  Spanish
//
//

import type en from './en'

const es: typeof en = {
    profile: {
        role: 'Ingeniero de Machine Learning',
        tagline: 'Construyo sistemas LLM que aguantan tráfico en producción.',
        location: 'Madrid, España · Disponible en remoto',
        downloadResume: 'Descargar CV',
        getInTouch: 'Contactar',
        emailSubject: 'Hola Rubén',
        moreAboutMe: 'Más sobre mí',
        facts: {
            experience: { label: 'Experiencia', value: '9 años construyendo sistemas de IA conversacional y de voz' },
            currently: { label: 'Actualmente', value: 'Technical Lead en Canaia' },
            focus: { label: 'Enfoque', value: 'Pipelines de voz y agentes basados en LLM en producción' },
            stack: { label: 'Stack', value: 'Python, PyTorch, LangChain/LangGraph, FastAPI, GCP' },
        },
    },
    chat: {
        title: 'Asistente',
        subtitle: 'Pregunta a mi IA sobre mi trabajo, por voz o por texto',
        orType: 'o escribe una pregunta',
        thinking: 'Pensando…',
        error: 'No he podido conectar con el asistente. Comprueba tu conexión e inténtalo de nuevo.',
        voice: {
            speakNow: 'Habla ahora',
            end: 'Terminar',
            status: {
                idle: 'Habla con mi asistente en tiempo real',
                connecting: 'Conectando…',
                listening: 'Escuchando…',
                speaking: 'Hablando…',
            },
            comingSoon: {
                title: 'El modo de voz llegará pronto',
                description: 'Todavía estoy montando el pipeline de voz. ¡Por ahora, pregúntame lo que quieras por texto!',
                dismiss: 'Entendido',
            },
        },
        composer: {
            placeholder: 'Escribe al asistente…',
            send: 'Enviar mensaje',
        },
        suggestions: {
            experience: '¿Qué has construido en producción?',
            voice: '¿Cómo diseñas agentes de voz?',
            stack: '¿Cuál es tu stack tecnológico?',
        },
    },
}

export default es
