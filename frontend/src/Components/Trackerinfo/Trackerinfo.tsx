import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
} from '@material-ui/core'
import React from 'react'
import Charts from '../Charts/Charts'

const Trackerinfo = () => {
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
                <Box mt={5}>
                    <Card>
                        <Grid container xs={12}>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Name:</b> {dummy1.name}
                                    </Typography>
                                </CardContent>
                            </Grid>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Max temperature:</b>
                                        {dummy1.maxTemperature}
                                    </Typography>
                                </CardContent>
                            </Grid>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Max humidity:</b>
                                        {dummy1.maxHumidity}
                                    </Typography>
                                </CardContent>
                            </Grid>
                        </Grid>
                        <Grid container xs={12}>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Max impact:</b> {dummy1.maxImpact}
                                    </Typography>
                                </CardContent>
                            </Grid>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Min temperature:</b>
                                        {dummy1.minTemperature}
                                    </Typography>
                                </CardContent>
                            </Grid>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Min humidity:</b>
                                        {dummy1.minHumidity}
                                    </Typography>
                                </CardContent>
                            </Grid>
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
