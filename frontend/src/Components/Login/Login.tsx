import React, { useContext, useState } from 'react'
import './Login.css'
import { Context } from '../../Context/ContextProvider'
import {
    Button,
    Collapse,
    Grid,
    IconButton,
    TextField,
} from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import Alert from '@material-ui/lab/Alert'
import CloseIcon from '@material-ui/icons/Close'

const Login = () => {
    const [userName, setUserName] = useState('')
    const history = useHistory()
    const context = useContext(Context)
    const [open, setOpen] = React.useState(true)
    const submit = () => {
        context.setIsLoggedIn(true)
        context.setUserName(userName)
        context.setWarning('')
        history.push('trackers')
    }
    return (
        <Grid className="Login">
            {context.warning !== '' && (
                <Collapse in={open}>
                    <Alert
                        severity="warning"
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setOpen(false)
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                    >
                        {context.warning}
                    </Alert>
                </Collapse>
            )}
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
