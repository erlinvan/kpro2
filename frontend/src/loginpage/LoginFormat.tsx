import React from 'react'
import UsernameComp from './UsernameComp'
import PasswordComp from './PasswordComp'
import LoginButtonUser from './LoginButton'
import NewUser from './NewUser'
import './LoginFormat.css'
import { Grid } from '@material-ui/core'

const LoginFormat = () =>{
    return (
        <Grid className="LoginFormat">
            <UsernameComp/>
            <PasswordComp/>
            <LoginButtonUser/>
            <NewUser/>
            </Grid>
    )
}

export default LoginFormat