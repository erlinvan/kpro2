import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
} from '@material-ui/core'
import React from 'react'

const Trackerinfo = () => {
    const dummy1: trackerifno = {
        name: 'Dummy1',
        maxHumidity: '2',
        minHumidity: '1',
        maxTemperature: '42C',
        minTemperature: '23C',
        maxImpact: '25 m/s^2',
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
                                        <b>Max temperature:</b>{' '}
                                        {dummy1.maxTemperature}
                                    </Typography>
                                </CardContent>
                            </Grid>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Max humidity:</b>{' '}
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
                                        <b>Min temperature:</b>{' '}
                                        {dummy1.minTemperature}
                                    </Typography>
                                </CardContent>
                            </Grid>
                            <Grid item xs={4}>
                                <CardContent>
                                    <Typography variant="body2" component="h2">
                                        <b>Min humidity:</b>{' '}
                                        {dummy1.minHumidity}
                                    </Typography>
                                </CardContent>
                            </Grid>
                        </Grid>
                    </Card>
                </Box>
            </Container>
        </>
    )
}

interface trackerifno {
    name: string
    maxImpact: string
    maxTemperature: string
    minTemperature: string
    maxHumidity: string
    minHumidity: string
}

export default Trackerinfo
