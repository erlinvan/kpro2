import React from 'react'
import './App.css'
import {
    BrowserRouter,
    Route,
    Switch,
} from 'react-router-dom'
import AppBar from './AppBar/AppBar'
import Trackerinfo from './Components/Trackerinfo/Trackerinfo'
import TrackerTable from './Components/TrackerSearch/SearchAndTableComponent'
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
                        <Route exact path="/trackers" component={TrackerTable} />
                        <Route exact path="/login" component={Login} />
                    </Switch>
                </BrowserRouter>
            </div>
        </>
    )
}

export default App
