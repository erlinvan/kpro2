import React, { Dispatch, SetStateAction, useContext } from 'react'
import TextField from '@material-ui/core/TextField'

type props = {
    setUserName: Dispatch<SetStateAction<string>>
}

const LoginComponent = ({ setUserName }: props) => {
    return (
        <TextField id="standard-basic" label="Username"
                   onChange={(event) => {
                       setUserName('' + event.target.value)
                   }} />
    )
}

export default LoginComponent