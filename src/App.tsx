//
//
//  APP
//
//

import Chat from "./components/Chat.tsx";
import About from "./components/About.tsx";

import classes from "./App.module.css"


function App() {
    return (
        <div className={classes.wrapper}>
            <div className={classes.leftSection}>
                <About/>
            </div>
            <div className={classes.rightSection}>
                <Chat/>
            </div>
        </div>
    )
}

export default App
