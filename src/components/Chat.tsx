//
//
//  Chat
//
//

import classes from './Chat.module.css'
import sendImg from '../assets/send.png'
import React, {useEffect, useRef, useState} from "react"
import {Message as MessageInterface} from "../interfaces.ts"
import MeAvatar from "./MeAvatar.tsx"
import UserAvatar from "./UserAvatar.tsx"
import Message from './Message.tsx'
import downArrowImg from "../assets/down-arrow.png"
import {t, Trans} from "@lingui/macro"


async function* createChatCompletion(messages: MessageInterface[]) {
    const response = await fetch(import.meta.env.VITE_API_URL + "/chat", {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({messages: messages})
    })

    if (!response.body) {
        return
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const {value, done} = await reader.read()

        if (done) {
            break
        }

        yield value
    }
}

function Chat() {
    const messagesEndRef = useRef<null | HTMLLIElement>(null)
    const messagesContainerRef = useRef<null | HTMLUListElement>(null)
    const [scrollButtonVisible, setScrollButtonVisible] = useState(false)
    const [messages, setMessages]  = useState<MessageInterface[]>([])

    useEffect(() => {
        const initialMessage =  t`
            Hello! I am Rubén Salas' AI assistant. I can provide information about Rubén's professional life, including his skills, projects, work experience, educational background, and languages.
            Feel free to ask any questions related to these topics!
        `
        setMessages([
            {
                "role": "assistant",
                "content": initialMessage
            }
        ])
    }, [])

    useEffect(() => {
       // Hide the scroll button when the user scrolls to the bottom
       // Show the scroll button when the user scrolls up
       const handleScroll = () => {
               setTimeout(() => {
                   if (messagesContainerRef.current) {
                       const {scrollTop, scrollHeight, clientHeight} = messagesContainerRef.current
                       const atBottom = scrollHeight - scrollTop === clientHeight
                       setScrollButtonVisible(!atBottom)
                   }
               }, 500)
       }

       const messagesRef = messagesContainerRef.current

       if (messagesRef) {
           messagesRef.addEventListener('scroll', handleScroll)
       }

       return () => {
           if (messagesRef) {
               messagesRef.removeEventListener('scroll', handleScroll)
           }
       }
    }, [])

    useEffect(() => {
        if (messagesEndRef.current && messagesContainerRef.current) {
            if (!scrollButtonVisible) {
                messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
            }
        }
    }, [messages, scrollButtonVisible])

    async function onSubmit(event: React.FormEvent) {
        event.preventDefault()

        const form = event.target as HTMLFormElement
        const data = new FormData(form)

        const userMessage = data.get("message") as string

        const newMessages = [...messages]

        const botMessageIndex = newMessages.length + 1
        const botMessage = {
            "role": "assistant",
            "content": ""
        }

        newMessages.push({
            "role": "user",
            "content": userMessage
        })

        form.reset()

        setMessages([...newMessages, botMessage])

        for await (const value of createChatCompletion(newMessages)) {
            botMessage.content += value
            setMessages(prevMessages => {
                const newMessages = [...prevMessages]
                newMessages[botMessageIndex] = botMessage
                return newMessages
            })
        }
    }

    function scrollToBottom() {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }

    async function onShortCut(shortcutMessage: string) {
        const botMessage = {
            "role": "assistant",
            "content": ""
        }

        const newMessages = [
            ...messages,
            {
                "role": "user",
                "content": shortcutMessage
            }
        ]

        setMessages([
            ...newMessages,
            botMessage
        ])
        const botMessageIndex = 2

        for await (const value of createChatCompletion(newMessages)) {
            botMessage.content += value
            setMessages(prevMessages => {
                const newMessages = [...prevMessages]
                newMessages[botMessageIndex] = botMessage
                return newMessages
            })
        }
    }

    function onStudiesShortcut() {
        onShortCut(t`What are your studies?`).catch(console.error)
    }

    function onExperienceShortcut() {
        onShortCut(t`What is your work experience?`).catch(console.error)
    }

    function onSkillsShortcut() {
        onShortCut(t`What are your skills?`).catch(console.error)
    }

    function onContactShortcut() {
        onShortCut(t`How can I contact you?`).catch(console.error)
    }

    return (
        <div className={classes.wrapper}>
            <ul className={classes.messages} ref={messagesContainerRef}>
                {messages.map((message, index) => {
                    const messageNodeByRole: Record<string, React.ReactNode> = {
                        "assistant": <Message name="Rubén Salas" message={message.content}
                                              avatar={<MeAvatar size={30}/>}/>,
                        "user": <Message name={t`You`} message={message.content} avatar={<UserAvatar size={27}/>}/>,
                    }
                    const messageNode = messageNodeByRole[message.role]

                    return (
                        <li key={index} className={classes.messageItem}>
                            {messageNode}
                        </li>
                    )
                })}
                <li className={classes.dummyItem} ref={messagesEndRef}/>
            </ul>
            {scrollButtonVisible && (
                <button className={classes.scrollButton} onClick={scrollToBottom}>
                    <img src={downArrowImg} alt="Scroll to bottom"/>
                </button>

            )}
            <div>
                {messages.length < 2 && <div className={classes.shortcuts}>
                    <button type="button" onClick={onStudiesShortcut} className={classes.shortcutButton}>
                        <span className={classes.shortcutButtonTitle}>
                            <Trans>Studies</Trans>
                        </span>
                        <span className={classes.shortcutButtonDescription}>
                            <Trans>Learn about educational background</Trans>
                        </span>
                    </button>
                    <button type="button" onClick={onExperienceShortcut} className={classes.shortcutButton}>
                        <span className={classes.shortcutButtonTitle}>
                            <Trans>Experience</Trans>
                        </span>
                        <span className={classes.shortcutButtonDescription}>
                            <Trans>Learn about work experience</Trans>
                        </span>
                    </button>
                    <button type="button" onClick={onSkillsShortcut} className={classes.shortcutButton}>
                        <span className={classes.shortcutButtonTitle}>
                            <Trans>Skills</Trans>
                        </span>
                        <span className={classes.shortcutButtonDescription}>
                            <Trans>Learn about technical skills</Trans>
                        </span>
                    </button>
                    <button type="button" onClick={onContactShortcut} className={classes.shortcutButton}>
                        <span className={classes.shortcutButtonTitle}>
                            <Trans>Contact</Trans>
                        </span>
                        <span className={classes.shortcutButtonDescription}>
                            <Trans>Learn how you can contact me</Trans>
                        </span>
                    </button>
                </div>}
                <form className={classes.form} onSubmit={onSubmit}>
                    <input type="text" name="message" className={classes.input} placeholder={t`Start typing ...`}/>
                    <button type="submit" className={classes.submit}>
                        <img className={classes.submitIcon} src={sendImg} alt="Send image"/>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Chat
