import React from 'react'
import './App.css'
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom'
import Trackerinfo from './Components/Trackerinfo/Trackerinfo'
import Login from './Components/Login/Login'
import SearchAndTableComponent from './Components/TrackerSearch/SearchAndTableComponent'
import ContextProvider from './Context/ContextProvider'
import LandingPage from './Components/LandingPage/LandingPage'
import AppBar from './Components/AppBar/AppBar'

function App() {
    return (
        <ContextProvider>
            <div>
                <BrowserRouter>
                    <AppBar />
                    <Switch>
                        <Route exact path="/" component={LandingPage} />
                        <Route
                            exact
                            path="/trackerinfo"
                            component={Trackerinfo}
                        />
                        <Route
                            exact
                            path="/trackers"
                            component={SearchAndTableComponent}
                        />
                        <Route exact path="/login" component={Login} />
                        <Route exact path="/refresh">
                            <Redirect to="trackerinfo"></Redirect>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </div>
        </ContextProvider>
    )
}

export default App
