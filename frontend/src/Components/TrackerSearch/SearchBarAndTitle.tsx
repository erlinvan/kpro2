import React, { Dispatch, SetStateAction } from 'react'
import TextField from '@material-ui/core/TextField'

type props = {
    setSearchString: Dispatch<SetStateAction<string>>
}

const SearchBarAndTitle = ({ setSearchString }: props) => {
    return (
        <TextField
            variant={'outlined'}
            style={searchBarAndTitleStyle}
            id="standard-basic"
            label="Search for tracker"
            onChange={(event) => {
                setSearchString('' + event.target.value)
                isNaN(Number(event.target.value)) ? console.log('ja'): console.log('nei')
            }}
        />
    )
}

const searchBarAndTitleStyle = {
    width: '59%',
    marginLeft: '7px'
}

export default SearchBarAndTitle
