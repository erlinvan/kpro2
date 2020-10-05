import { Box, Card, Container, Grid } from '@material-ui/core'
import React from 'react'
import Charts from '../Charts/Charts'
import CardInfo from './CardInfo/CardInfo'
import IconButton from '@material-ui/core/IconButton'
import ArrowDownwardIcon from '@material-ui/icons/ArrowBack'
import { useHistory } from 'react-router-dom'

const Trackerinfo = () => {
    const history = useHistory()

    //Place holders until we can fetch data from API.
    const dummy1: trackerinfo = {
        name: 'Dummy1',
        maxHumidity: '2',
        minHumidity: '1',
        maxTemperature: '42C',
        minTemperature: '23C',
        maxImpact: '25 m/s^2',
    }
    const temperatureChart = {
        yAxis: [1, 2, 1, 4, 3, 6],
        xAxis: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        type: 'Temperature',
    }
    const humidityChart = {
        yAxis: [15, 16, 27, 20, 18, 19],
        xAxis: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
        type: 'Humidity',
    }
    return (
        <>
            <Container>

                    <IconButton aria-label="delete" onClick={() => {
                        history.push('trackers')
                    }}>
                        <ArrowDownwardIcon fontSize="inherit" />
                    </IconButton>

                    <Box mt={5}>
                        <Card>
                            <Grid container xs={12}>
                                <CardInfo parameter="Name" value={dummy1.name} />
                                <CardInfo
                                    parameter="Max Temperature"
                                    value={dummy1.maxTemperature}
                                />
                                <CardInfo
                                    parameter="Max Humidity"
                                    value={dummy1.maxHumidity}
                                />
                            </Grid>
                            <Grid container xs={12}>
                                <CardInfo
                                    parameter="Max impact"
                                    value={dummy1.maxImpact}
                                />
                                <CardInfo
                                    parameter="Min Temperature"
                                    value={dummy1.minTemperature}
                                />
                                <CardInfo
                                    parameter="Min humidity"
                                    value={dummy1.minHumidity}
                                />
                            </Grid>
                        </Card>
                    </Box>

            </Container>
            <Charts data={temperatureChart} />
            <Charts data={humidityChart} />
        </>
    )
}

interface trackerinfo {
    name: string
    maxImpact: string
    maxTemperature: string
    minTemperature: string
    maxHumidity: string
    minHumidity: string
}

export default Trackerinfo
