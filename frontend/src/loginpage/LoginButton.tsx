import React, { useContext } from 'react'
import Button from '@material-ui/core/Button';
import {useHistory} from 'react-router-dom';
import {Context} from '../Context/ContextProvider';

const LoginButton= () => {
    const history = useHistory();
    const context = useContext( Context)
    return(
        <Button variant="contained" onClick={()=>{
            context.setIsLoggedIn(true);
            history.push('trackers')
        }}>Sign in</Button>
    )
}

export default LoginButton;
