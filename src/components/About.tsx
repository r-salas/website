//
//
//  About
//
//

import meImg from "../assets/me.png"
import emailImg from "../assets/email.png"
import githubImg from "../assets/github.png"
import phoneImg from "../assets/phone.png"
import websiteImg from "../assets/website.png"
import downloadImg from "../assets/download.png"
import classes from "./About.module.css"


function About() {
    return (
        <div className={classes.wrapper}>
            <img src={meImg} alt="Me" className={classes.img}/>
            <h1 className={classes.title}>Hello, I'm Rubén Salas</h1>
            <p className={classes.description}>Machine Learning Engineer <br/>specializing in crafting conversational assistants <br/>to enhance user experiences.</p>

            <div className={classes.socials}>
                <div className={classes.social}>
                    <img src={emailImg} alt="Email" className={classes.socialIcon}/>
                    <a className={classes.socialLink} href="mailto:ruben.sls@outlook.com">ruben.sls@outlook.com</a>
                </div>
                <div className={classes.social}>
                    <img src={githubImg} alt="Github" className={classes.socialIcon}/>
                    <a className={classes.socialLink} href="https://github.com/r-salas">github.com/r-salas</a>
                </div>
                <div className={classes.social}>
                    <img src={phoneImg} alt="Phone" className={classes.socialIcon}/>
                    <a className={classes.socialLink} href="tel:+34617691908">+34 617 69 19 08</a>
                </div>
                <div className={classes.social}>
                    <img src={websiteImg} alt="Website" className={classes.socialIcon}/>
                    <a className={classes.socialLink} href="https://rubensalas.ai">rubensalas.ai</a>
                </div>
            </div>
            <a href={import.meta.env.VITE_API_URL + "/static/Resume - EN.pdf"} className={classes.downloadResumeButton} target="_blank">
                <img src={downloadImg} alt="Download"/>
                Resume
            </a>
        </div>
    )
}

export default About
