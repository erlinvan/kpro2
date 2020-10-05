import React, { useEffect, useState } from 'react'
import SearchBarAndTitle from './SearchBarAndTitle'
import TrackerDataGrid from './TrackerDataGrid'
import './SearchAndTableComponent.css'
import TrackerMap from './TrackerMap'
import { ITrackers } from '../../Interfaces/ITrackers'
import useFetch from '../../utils/useFetch'
import { CircularProgress } from '@material-ui/core'

const SearchAndTableComponent = () => {
    const [searchString, setSearchString] = useState('')
    const [filteredData, setFilteredData] = useState<ITrackers[]>()
    const { response: trackers } = useFetch<ITrackers[]>(
        'tracker/?company=apple'
    )
    useEffect(() => {
        setFilteredData([])
        trackers &&
            trackers.map(
                (e) =>
                    String(e.id).includes(searchString) &&
                    setFilteredData((filteredData) => [...filteredData, e])
            )
    }, [searchString, trackers])
    useEffect(() => {
        trackers && setFilteredData(trackers)
    }, [trackers])

    if (trackers && filteredData && trackers.length > 0) {
        return (
            <div className="searchBarAndTitleStyle">
                <SearchBarAndTitle setSearchString={setSearchString} />
                <TrackerDataGrid data={filteredData} />
                <TrackerMap data={trackers} />
            </div>
        )
    }
    return <CircularProgress />
}

export default SearchAndTableComponent
