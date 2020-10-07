import React, { useContext, useEffect } from 'react'
import { Context } from '../../Context/ContextProvider'
import { useHistory, withRouter } from 'react-router-dom'


const LandingPage = () => {
    const history = useHistory()
    const context = useContext(Context)
    const startRouting = context.isLoggedIn ? 'trackers' : 'login'
    useEffect(() => {
        history.push(startRouting)
    }, [history, startRouting])

    return (
        <>
        </>
    )
}


export default withRouter(LandingPage)
