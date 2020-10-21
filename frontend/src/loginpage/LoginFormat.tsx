import React, { useContext, useState } from 'react'
import './LoginFormat.css'
import { Grid, TextField } from '@material-ui/core'
import Button from '@material-ui/core/Button/Button'
import { useHistory } from 'react-router-dom'
import { Context } from '../Context/ContextProvider'

const LoginFormat = () => {
    const [userName, setUserName] = useState('')
    const history = useHistory()
    const context = useContext(Context)
    const submit = () => {
        context.setIsLoggedIn(true)
        context.setUserName(userName)
        history.push('trackers')
    }
    return (
        <Grid className="LoginFormat">
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

export default LoginFormat
