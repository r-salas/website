//
//
//  Placeholder avatar
//
//

import userImg from "../assets/user.png";

function UserAvatar({size}: {size: number}) {
    return (
        <img src={userImg} alt="User avatar" style={{width: size, height: size}}/>
    )
}

export default UserAvatar
