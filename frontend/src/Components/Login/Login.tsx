import React, { useContext, useState } from 'react'
import './Login.css'
import { Context } from '../../Context/ContextProvider'
import { Button, Grid, TextField } from '@material-ui/core'
import { useHistory } from 'react-router-dom'

const Login = () => {
    const [userName, setUserName] = useState('')
    const history = useHistory()
    const context = useContext(Context)
    const submit = () => {
        context.setIsLoggedIn(true)
        context.setUserName(userName)
        history.push('trackers')
    }
    return (
        <Grid className="Login">
            <TextField
                id="standard-basic"
                label="Username"
                onKeyPress={(event) => {
                    event.key === 'Enter' && submit()
                }}
                onChange={(event) => {
                    setUserName('' + event.target.value)
                }}
            />
            <br></br>
            <Button
                variant="contained"
                onClick={() => {
                    submit()
                }}
            >
                Sign in
            </Button>
        </Grid>
    )
}

export default Login
