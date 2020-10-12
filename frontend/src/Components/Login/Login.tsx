import React, { useContext } from 'react'
import LoginFormat from '../../loginpage/LoginFormat'
import { Context } from '../../Context/ContextProvider'


const Login = () => {
    const context = useContext(Context)
    return (
        <>
            {!context.isLoggedIn && <LoginFormat /> }

        </>
    )
}

export default Login
