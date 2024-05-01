//
//
//  Message
//
//

import classes from "./Message.module.css";
import React from "react";
import Markdown from 'react-markdown'


function Message({name, message, avatar}: {name: string, message: string, avatar: React.ReactNode}) {
    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                {avatar}
                <p className={classes.name}>{name}</p>
            </div>
            <div className={classes.messageWrapper}>
                <Markdown className={classes.message}>
                    {message}
                </Markdown>
            </div>
        </div>
    )
}

export default Message
