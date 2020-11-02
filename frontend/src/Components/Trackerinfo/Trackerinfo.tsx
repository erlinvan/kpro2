import { Box, Button, Card, Container, Grid } from '@material-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { IBeacondata, ITrackerinfo } from '../../Interfaces/ITrackerinfo'
import useFetch from '../../utils/useFetch'
import Charts from '../Charts/Charts'
import CardInfo from './CardInfo/CardInfo'
import IconButton from '@material-ui/core/IconButton'
import ArrowDownwardIcon from '@material-ui/icons/ArrowBack'
import { Link, useHistory } from 'react-router-dom'
import './TrackerInfo.css'
import { Context } from '../../Context/ContextProvider'
import HistoricTrackerMap from './HistoricTrackerMap'
import SyncIcon from '@material-ui/icons/Sync'

const Trackerinfo = () => {
    const context = useContext(Context)
    const history = useHistory()
    const [chosenTracker, setChosenTracker] = useState('')
    const [cardData, setCardData] = useState<trackerinfo>({
        name: '',
        maxHumidity: '',
        minHumidity: '',
        maxTemperature: '',
        minTemperature: '',
    })
    const { response: trackerinfo } = useFetch<ITrackerinfo[]>(
        'tracker/?id=' + context.trackerID
    )
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
        setTimestamp((Timestamp) => [
            ...Timestamp,
            beacondata.timestamp.split('.')[0],
        ])
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
            {context.isLoggedIn ? (
                <>
                    <Container>
                        <Box mt={5}>
                            <div className="backButtonAndCardWrapper">
                                <IconButton
                                    aria-label="delete"
                                    onClick={() => {
                                        history.push('trackers')
                                    }}
                                >
                                    <ArrowDownwardIcon fontSize="inherit" />
                                </IconButton>
                                <Card elevation={5} className="trackerInfoCard">
                                    <Grid container>
                                        <CardInfo
                                            parameter="Name"
                                            value={cardData.name}
                                        />
                                        <CardInfo
                                            parameter="Max Temperature"
                                            value={cardData.maxTemperature}
                                        />
                                        <CardInfo
                                            parameter="Max Humidity"
                                            value={cardData.maxHumidity}
                                        />
                                    </Grid>
                                    <Grid container>
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
                                <Link to="refresh">
                                    <Button onClick={() => {}}>
                                        <SyncIcon></SyncIcon>
                                    </Button>
                                </Link>
                            </div>
                        </Box>
                    </Container>
                    <br></br>
                    <br></br>
                    <Grid container spacing={1}>
                        <Grid item xs={7}>
                            <Charts
                                data={temperatureChart}
                                setChosenTracker={setChosenTracker}
                            />
                            <Charts
                                data={humidityChart}
                                setChosenTracker={setChosenTracker}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            {trackerinfo && (
                                <HistoricTrackerMap
                                    data={trackerinfo}
                                    chosenTracker={chosenTracker}
                                />
                            )}
                        </Grid>
                        <Grid item></Grid>
                    </Grid>
                    \
                </>
            ) : (
                history.push('login')
            )}
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
