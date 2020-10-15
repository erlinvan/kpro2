import React, { useContext, useEffect, useState } from 'react'
import SearchBarAndTitle from './SearchBarAndTitle'
import TrackerDataGrid from './TrackerDataGrid'
import './SearchAndTableComponent.css'
import TrackerMap from './TrackerMap'

import { withRouter } from 'react-router-dom'
import { Context } from '../../Context/ContextProvider'
import { useHistory } from 'react-router-dom'


import { ITrackers } from '../../Interfaces/ITrackers'
import useFetch from '../../utils/useFetch'
import { CircularProgress } from '@material-ui/core'

const SearchAndTableComponent = () => {

    const context = useContext(Context)
    const history = useHistory()
    const [searchString, setSearchString] = useState('')
    const [filteredData, setFilteredData] = useState<ITrackers[]>()
    const { response: trackers } = useFetch<ITrackers[]>(
        'tracker/?company=apple',
    )
    useEffect(() => {
        setFilteredData([])
        trackers &&
        trackers.forEach(
            (e) =>
                String(e.id).includes(searchString) &&
                setFilteredData((filteredData) => [...filteredData, e]),
        )
    }, [searchString, trackers])
    useEffect(() => {
        trackers && setFilteredData(trackers)
    }, [trackers])

    if (trackers && filteredData && trackers.length > 0) {
        return (
            <>
                {context.isLoggedIn ?
                    <div className="searchBarAndTitleStyle">
                        <SearchBarAndTitle setSearchString={setSearchString} />
                        <div className="mapAndGridStyle">
                            <TrackerDataGrid data={filteredData} />
                            <TrackerMap data={filteredData} />
                        </div>
                    </div> :

                    history.push('login')
                }
            </>
        )
    }
    return <CircularProgress/>
}

export default withRouter(SearchAndTableComponent)

