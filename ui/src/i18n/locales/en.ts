//
//
//  English
//
//

const en = {
    profile: {
        role: 'Machine Learning Engineer',
        tagline: 'I build LLM systems that survive production traffic.',
        location: 'Madrid, Spain · Open to remote',
        downloadResume: 'Download resume',
        getInTouch: 'Get in touch',
        emailSubject: 'Hi Rubén',
        moreAboutMe: 'More about me',
        facts: {
            experience: { label: 'Experience', value: '9 years building conversational & voice AI systems' },
            currently: { label: 'Currently', value: 'Technical Lead at Canaia' },
            focus: { label: 'Focus', value: 'Voice pipelines & LLM-based agents in production' },
            stack: { label: 'Stack', value: 'Python, PyTorch, LangChain/LangGraph, FastAPI, GCP' },
        },
    },
    chat: {
        title: 'Assistant',
        subtitle: 'Ask my AI anything about my work, by voice or text',
        orType: 'or type a question',
        thinking: 'Thinking…',
        error: "Sorry, I couldn't reach the assistant. Please check your connection and try again.",
        voice: {
            speakNow: 'Speak now',
            end: 'End',
            status: {
                idle: 'Talk to my assistant in real time',
                connecting: 'Connecting…',
                listening: 'Listening…',
                speaking: 'Speaking…',
            },
            comingSoon: {
                title: 'Voice mode is coming soon',
                description: "I'm still wiring up the voice pipeline. For now, ask me anything by text!",
                dismiss: 'Got it',
            },
        },
        composer: {
            placeholder: 'Message the assistant…',
            send: 'Send message',
        },
        suggestions: {
            experience: 'What have you built in production?',
            voice: 'How do you design voice agents?',
            stack: 'What is your tech stack?',
        },
    },
}

export default en
