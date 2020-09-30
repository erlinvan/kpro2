import { Box, Card, Container, Grid } from '@material-ui/core'
import React, { useEffect, useState } from 'react'
import { IBeacondata, ITrackerinfo } from '../../Interfaces/ITrackerinfo'
import useFetch from '../../utils/useFetch'
import Charts from '../Charts/Charts'
import CardInfo from './CardInfo/CardInfo'

const Trackerinfo = () => {
    const [cardData, setCardData] = useState<trackerinfo>({
        name: '',
        maxHumidity: '',
        minHumidity: '',
        maxTemperature: '',
        minTemperature: '',
    })
    //Hard code for now tracker id.
    const { response: trackerinfo } = useFetch<ITrackerinfo[]>('tracker/?id=1')
    const [Temperature, setTemperature] = useState<number[]>([])
    const [Humidity, setHumidity] = useState<number[]>([])
    const [Timestamp, setTimestamp] = useState<string[]>([])

    const humidityChart = {
        yAxis: Humidity,
        type: 'Humidity',
        timestamp: Timestamp,
    }
    const temperatureChart = {
        yAxis: Temperature,
        type: 'Temperature',
        timestamp: Timestamp,
    }

    const formatData = (beacondata: IBeacondata) => {
        setTemperature((Temperature) => [
            ...Temperature,
            parseInt(beacondata.temperature),
        ])
        setHumidity((Humidity) => [...Humidity, parseInt(beacondata.humidity)])
        setTimestamp((Timestamp) => [...Timestamp, beacondata.timestamp])
    }
    useEffect(() => {
        trackerinfo &&
            trackerinfo.length !== 0 &&
            trackerinfo.map((beacondata) =>
                beacondata.beacon_data.map((e) => formatData(e))
            )
    }, [trackerinfo])

    useEffect(() => {
        trackerinfo &&
            setCardData({
                name: trackerinfo[0].id,
                maxHumidity: Math.max.apply(Math, Humidity).toString(),
                maxTemperature: Math.max.apply(Math, Temperature).toString(),
                minHumidity: Math.min.apply(Math, Humidity).toString(),
                minTemperature: Math.min.apply(Math, Temperature).toString(),
            })
    }, [Temperature, Humidity, trackerinfo])
    return (
        <>
            <Container>
                <Box mt={5}>
                    <Card elevation={5}>
                        <Grid container xs={12}>
                            <CardInfo parameter="Name" value={cardData.name} />
                            <CardInfo
                                parameter="Max Temperature"
                                value={cardData.maxTemperature}
                            />
                            <CardInfo
                                parameter="Max Humidity"
                                value={cardData.maxHumidity}
                            />
                        </Grid>
                        <Grid container xs={12}>
                            <Grid item xs={4}></Grid>
                            <CardInfo
                                parameter="Min Temperature"
                                value={cardData.minTemperature}
                            />
                            <CardInfo
                                parameter="Min humidity"
                                value={cardData.minHumidity}
                            />
                        </Grid>
                    </Card>
                </Box>
            </Container>
            <br></br>
            <Charts data={temperatureChart} />
            <Charts data={humidityChart} />
        </>
    )
}

interface trackerinfo {
    name: string
    maxTemperature: string
    minTemperature: string
    maxHumidity: string
    minHumidity: string
}

export default Trackerinfo
