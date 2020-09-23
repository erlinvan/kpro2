import React from 'react'
import { GridOverlay, DataGrid, ColDef } from '@material-ui/data-grid'
import LinearProgress from '@material-ui/core/LinearProgress'

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
            <div style={{ position: 'absolute', top: 0, width: '100%' }}>
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


// This grid needs to communicate with another page. The current implementation only logs which record has been pressed,
// it does not actually go to said log.
const TrackerDataGrid = ({ data}: props) => {

    return (
        <div style={{ height: 400, width: '40%' }}>
            <Typography variant="h6" style={{ margin: 4 }}> Recently updated trackers</Typography>
            <DataGrid rows={data} columns={columns} pageSize={5} onRowClick={(params) => {
                console.log(params.data.id)
            }} components={{
                loadingOverlay: CustomLoadingOverlay,
            }}
            />
        </div>
    )
}


export default TrackerDataGrid
