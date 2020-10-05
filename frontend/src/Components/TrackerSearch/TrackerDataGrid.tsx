import React from 'react'
import { GridOverlay, DataGrid, ColDef } from '@material-ui/data-grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import './SearchAndTableComponent.css'
import { useHistory } from 'react-router-dom'

import { Typography } from '@material-ui/core'


const columns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'timeStamp', headerName: 'Timestamp', width: 130 },

]
// This function is to be used for when this actually loads data from an API.
// Currently won't show up, since all data is saved locally, not fetched.
function CustomLoadingOverlay() {
    return (
        <GridOverlay>
            <div className="gridOverlay">
                <LinearProgress />
            </div>
        </GridOverlay>
    )
}

// Here as well I am not familiar enough with TS
// will look into the correct data types later. TODO: Change to correct types
type props = {
    data: any,
}

/* Do not remove; this will be used when setting context.
    onRowClick={(params) => {console.log(params.data.id)}}
 */
const TrackerDataGrid = ({ data }: props) => {
    const history = useHistory()
    return (
        <div className="trackerDataGrid">
            <Typography variant="h6" style={typographyStyle}> Recently updated trackers</Typography>
            <DataGrid rows={data} columns={columns} pageSize={5} onRowClick={(params) => {
                history.push('trackerinfo')
            }} components={{
                loadingOverlay: CustomLoadingOverlay,
            }}
            />
        </div>
    )
}


const typographyStyle = {
    margin: 4,
}


export default TrackerDataGrid
