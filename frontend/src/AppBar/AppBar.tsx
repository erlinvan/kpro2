import React, { useContext } from 'react'
import AppBarMUI from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import './AppBar.css'
import { withRouter, useHistory } from 'react-router-dom'
import { Context } from '../Context/ContextProvider'
import { Grid } from '@material-ui/core'

const AppBar = () => {
    const history = useHistory()
    const context = useContext(Context)

    return (
        <AppBarMUI position="static">
            <Toolbar>
                <Grid container>
                    <Grid item xs>
                        {context.isLoggedIn ? (
                            <Typography variant="h6">
                                {context.userName}
                            </Typography>
                        ) : (
                            <Typography variant="h6">TRCKPCK</Typography>
                        )}
                    </Grid>
                    <Grid item xs={8}></Grid>
                    {context.isLoggedIn && (
                        <>
                            <Grid item xs>
                                <Button
                                    color="inherit"
                                    onClick={() => {
                                        history.push('trackers')
                                    }}
                                >
                                    <Typography variant="h6">
                                        My Trackers
                                    </Typography>
                                </Button>
                            </Grid>
                            <Grid item xs>
                                <Button
                                    color="inherit"
                                    onClick={() => {
                                        context.setIsLoggedIn(
                                            !context.isLoggedIn
                                        )
                                        history.push('login')
                                    }}
                                >
                                    <Typography variant="h6">
                                        Sign out
                                    </Typography>
                                </Button>
                            </Grid>
                        </>
                    )}
                </Grid>
            </Toolbar>
        </AppBarMUI>
    )
}

export default withRouter(AppBar)
