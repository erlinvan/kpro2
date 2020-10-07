import React from 'react'
import './App.css'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import AppBar from './AppBar/AppBar'
import Trackerinfo from './Components/Trackerinfo/Trackerinfo'
import Login from './Components/Login/Login'
import SearchAndTableComponent from './Components/TrackerSearch/SearchAndTableComponent'
import ContextProvider from './Context/ContextProvider'

function App() {
    return (
        <ContextProvider>
            <div>
                <BrowserRouter>
                    <AppBar />
                    <Switch>
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
                    </Switch>
                </BrowserRouter>
            </div>
        </ContextProvider>
    )
}

export default App
