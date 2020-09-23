import React from 'react'
import TextField from '@material-ui/core/TextField'


const SearchBarAndTitle = () => {
    return (
        <TextField variant={'outlined'} style={{ width:'40%' }}
                   id="standard-basic" label="Search for tracker"
        />
    )
}

export default SearchBarAndTitle


