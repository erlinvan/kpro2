import React from 'react'
import './App.css'
import {
    BrowserRouter,
    Route,
    Router,
    Switch,
    withRouter,
} from 'react-router-dom'
import AppBar from './AppBar/AppBar'
import Trackerinfo from './Components/Trackerinfo/Trackerinfo'
import Trackers from './Components/Trackerinfo/Trackers/Trackers'
import Login from './Components/Trackerinfo/Login/Login'

function App() {
    return (
        <>
            <div className="App">
                <AppBar></AppBar>
            </div>
            <div>
                <BrowserRouter>
                    <Switch>
                        <Route
                            exact
                            path="/trackerinfo"
                            component={Trackerinfo}
                        />
                        <Route exact path="/trackers" component={Trackers} />
                        <Route exact path="/login" component={Login} />
                    </Switch>
                </BrowserRouter>
            </div>
        </>
    )
}

export default App
