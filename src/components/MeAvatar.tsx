//
//
//  Me Avatar
//
//

import meImg from "../assets/me.png";


function MeAvatar({size}: {size: number}) {
    return (
        <img src={meImg} alt="Me" style={{width: size, height: size}}/>
    )
}

export default MeAvatar
