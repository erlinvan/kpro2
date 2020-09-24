import React, { useEffect, useState } from 'react'
import SearchBarAndTitle from './SearchBarAndTitle'
import TrackerDataGrid from './TrackerDataGrid'
import data from './mockData/data.json'
import './SearchAndTableComponent.css'


const SearchAndTableComponent = () => {

    const [searchString, setSearchString] = useState('');
    const [filteredData, setFilteredData] = useState(data);

    useEffect( ()=>{
        setFilteredData(data.filter(tracker => tracker.id.includes(searchString) ))
    }, [searchString])

    return (
        <div className="searchBarAndTitleStyle">
            <SearchBarAndTitle setSearchString={setSearchString}/>
            <TrackerDataGrid data={filteredData}/>
        </div>
    )
}

export default SearchAndTableComponent;
