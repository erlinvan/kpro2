import React from 'react'
import { GridOverlay, DataGrid, ColDef } from '@material-ui/data-grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import './SearchAndTableComponent.css'
import { useHistory } from 'react-router-dom'

import { Typography } from '@material-ui/core'
import { ITrackers } from '../../Interfaces/ITrackers'

const columns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'timestamp', headerName: 'Timestamp', width: 300 },
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

type props = {
    data: ITrackers[]
}


// This grid needs to communicate with another page. The current implementation only logs which record has been pressed,
// it does not actually go to said log.
/* Do not remove; this will be used when setting context.
    onRowClick={(params) => {console.log(params.data.id)}}
 */
const TrackerDataGrid = ({ data }: props) => {
    const history = useHistory()
    return (
        <div className="trackerDataGrid">
            <Typography variant="h6" style={typographyStyle}>
                Recently updated trackers
            </Typography>
            <DataGrid
                rows={data}
                columns={columns}
                pageSize={5}
                onRowClick={(params) => {
                    history.push('trackerinfo')
                }}
                components={{
                    loadingOverlay: CustomLoadingOverlay,
                }}

            />
        </div>
    )
}

const typographyStyle = {
    margin: 5,
}

export default TrackerDataGrid
