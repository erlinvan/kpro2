import React, { useContext } from 'react'
import { GridOverlay, DataGrid, ColDef } from '@material-ui/data-grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import './SearchAndTableComponent.css'
import { useHistory } from 'react-router-dom'

import { Typography } from '@material-ui/core'
import { ITrackers } from '../../Interfaces/ITrackers'
import { Context } from '../../Context/ContextProvider'

const columns: ColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'timestamp', headerName: 'Timestamp', width: 250 },
    { field: 'company', headerName: 'Company', width: 110 },
]
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

const TrackerDataGrid = ({ data }: props) => {
    const history = useHistory()
    const context = useContext(Context)

    const handleClick = (id: number) => {
        context.setTrackerID(id)
        history.push('trackerinfo')
    }
    return (
        <div className="trackerDataGrid">
            <Typography variant="h6" style={typographyStyle}>
                Recently updated trackers
            </Typography>
            <DataGrid
                rows={data}
                columns={columns}
                pageSize={10}
                onRowClick={(params) => handleClick(Number(params.data.id))}
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
