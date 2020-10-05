import React, { useContext, useEffect, useState } from 'react'
import SearchBarAndTitle from './SearchBarAndTitle'
import TrackerDataGrid from './TrackerDataGrid'
import data from './mockData/data.json'
import './SearchAndTableComponent.css'
import TrackerMap from './TrackerMap'
import { withRouter } from 'react-router'
import { Context } from '../../Context/ContextProvider'
import { Typography } from '@material-ui/core'


const SearchAndTableComponent = () => {

    const [searchString, setSearchString] = useState('')
    const [filteredData, setFilteredData] = useState(data)

    const context = useContext(Context)

    useEffect(() => {
        setFilteredData(data.filter(tracker => tracker.id.includes(searchString)))
    }, [searchString])

    return (
        <>
            {context.isLoggedIn ?
                <div className="searchBarAndTitleStyle">
                    <SearchBarAndTitle setSearchString={setSearchString} />
                    <TrackerDataGrid data={filteredData} />
                    <TrackerMap data={filteredData} />
                </div> :
                <Typography> You are not logged in!</Typography>}

        </>
    )
}

export default withRouter(SearchAndTableComponent)
