import React from 'react'
import UsernameComp from './UsernameComp'
import PasswordComp from './PasswordComp'
import LoginButtonUser from './LoginButton'
import NewUser from './NewUser'

function LoginFomat() {
    return (
        <div className="LoginFormat">
            <div className="Username "><UsernameComp></UsernameComp></div>
            <div className="PasswordComp"><PasswordComp></PasswordComp></div>
            <div className="LoginButtonUser"><LoginButtonUser></LoginButtonUser></div>
            <div className="Newuser"><NewUser></NewUser></div>
            </div>
    )
}

export default LoginFomat
