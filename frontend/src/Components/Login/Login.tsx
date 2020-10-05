import React, { useContext } from 'react'
import LoginFomat from '../../loginpage/LoginFormat'
import { Context } from '../../Context/ContextProvider'


const Login = () => {
    const context = useContext(Context)
    return (
        <>
            {!context.isLoggedIn && <LoginFomat /> }

        </>
    )
}

export default Login
