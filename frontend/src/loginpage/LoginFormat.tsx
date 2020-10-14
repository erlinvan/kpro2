import React, { useState } from 'react'
import UsernameComp from './UsernameComp'
import LoginButtonUser from './LoginButton'
import './LoginFormat.css'
import { Grid } from '@material-ui/core'


const LoginFormat = () => {


    const [userName, setUserName] = useState('')
    return (
        <Grid className="LoginFormat">
            <UsernameComp setUserName={setUserName} />

            <br></br>
            <LoginButtonUser userName={userName} />

        </Grid>
    )
}

export default LoginFormat
