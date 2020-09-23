import React from 'react'
import SearchBarAndTitle from './SearchBarAndTitle'
import TrackerDataGrid from './TrackerDataGrid'


const SearchAndTableComponent = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '10px',
            padding: '10px',
        }}>
            <SearchBarAndTitle />
            <TrackerDataGrid />
        </div>
    )
}

export default SearchAndTableComponent