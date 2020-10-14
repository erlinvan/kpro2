import React, { useContext } from 'react'
import AppBarMUI from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import './AppBar.css'
import { withRouter, useHistory } from 'react-router-dom'
import { Context } from '../Context/ContextProvider'

const AppBar = () => {
    const history = useHistory()

    const context = useContext(Context)
    return (
        <AppBarMUI position="static">
            <Toolbar>
                <Typography variant="h6">
                    trckpck
                </Typography>
                {
                    context.isLoggedIn ?
                        <Button color="inherit" onClick={() => {
                            history.push('trackers')
                        }}>
                            <Typography variant="h6">My Trackers</Typography>
                        </Button> : <></>
                }
                {
                    context.isLoggedIn ?
                        <Button color="inherit" onClick={() => {
                            context.isLoggedIn && context.setIsLoggedIn(!context.isLoggedIn)
                            history.push('login')
                        }}>
                            <Typography variant="h6">{context.isLoggedIn ? 'Sign out' : 'Sign in'}</Typography>
                        </Button> : <></>
                }
            </Toolbar>

        </AppBarMUI>
    )
}

export default withRouter(AppBar)
