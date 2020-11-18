import React, { useEffect, useState } from 'react'
import { Map, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import './TrackerInfo.css'
import { IGPSData } from '../../Interfaces/ITrackers'
import L from 'leaflet'

type props = {
    data: any
    chosenTracker: string
}

const HistoricTrackerMap = ({ data, chosenTracker }: props) => {
    const greenIcon = new L.Icon({
        iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })
    const blackIcon = new L.Icon({
        iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })
    const blueIcon = new L.Icon({
        iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })

    const [polylines, setPolylines] = useState<any>([])

    useEffect(() => {
        let tempPolylines = []
        for (let _i = 0; _i < data.length - 1; _i++) {
            tempPolylines.push([data[_i], data[_i + 1]])
        }
        setPolylines(
            tempPolylines.map((x) => {
                if (x[0].gps.lat !== '-9000' && x[1].gps.lat !== '-9000') {
                    return (
                        <Polyline
                            positions={[
                                [x[0].gps.lat, x[0].gps.lon],
                                [x[1].gps.lat, x[1].gps.lon],
                            ]}
                        />
                    )
                }
                // Eslint expects a return value. As no lines are to be plotted,
                //  we return nothing and ignore the warning.
                // eslint-disable-next-line array-callback-return
                return
            })
        )
    }, [data])

    return (
        <div>
            <Map
                center={[64.9139, 18.7522]}
                zoom={4.8}
                className="leaflet-container"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {data.map((d: any) =>
                    d.beacon_data.map(
                        (beacon_data: any) =>
                            beacon_data.latitude &&
                            beacon_data.timestamp &&
                            beacon_data.timestamp.split(':')[0] !==
                                chosenTracker.split(':')[0] && (
                                <Marker
                                    key={beacon_data.timestamp}
                                    icon={greenIcon}
                                    position={[
                                        beacon_data.latitude,
                                        beacon_data.longitude,
                                    ]}
                                >
                                    <Popup>{beacon_data.timestamp}</Popup>
                                </Marker>
                            )
                    )
                )}
                {data.map(
                    (trackerLocation: {
                        timestamp: string
                        time_stamp: string
                        gps: IGPSData
                    }) =>
                        trackerLocation.time_stamp && (
                            <Marker
                                key={trackerLocation.time_stamp}
                                icon={blueIcon}
                                position={[
                                    trackerLocation.gps.lat,
                                    trackerLocation.gps.lon,
                                ]}
                            >
                                <Popup>{trackerLocation.time_stamp}</Popup>
                            </Marker>
                        )
                )}
                {data.map((d: any) =>
                    d.beacon_data.map(
                        (beacon_data: any) =>
                            beacon_data.latitude &&
                            beacon_data.timestamp &&
                            beacon_data.timestamp.split(':')[0] ===
                                chosenTracker.split(':')[0] && (
                                <Marker
                                    icon={blackIcon}
                                    key={beacon_data.timestamp}
                                    position={[
                                        beacon_data.latitude,
                                        beacon_data.longitude,
                                    ]}
                                >
                                    <Popup>{beacon_data.description}</Popup>
                                </Marker>
                            )
                    )
                )}
                {polylines}
            </Map>
        </div>
    )
}

export default HistoricTrackerMap
