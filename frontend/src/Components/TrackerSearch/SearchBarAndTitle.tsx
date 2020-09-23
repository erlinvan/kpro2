import React from 'react'
import TextField from '@material-ui/core/TextField'


// Here I have set the type to any, as I found it challenging to set the
// type to function TODO: Change to correct data type
type props = {
    setSearchString: any,
}

const SearchBarAndTitle = ({ setSearchString }: props) => {
    return (
        <TextField variant={'outlined'} style={{ width: '40%' }}
                   id="standard-basic" label="Search for tracker"
                   onChange={(event) => {
                       setSearchString('' + event.target.value)
                   }}
        />
    )
}

export default SearchBarAndTitle
