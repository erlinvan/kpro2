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
    const [markers, setMarkers] = useState<any>([])
    const greenIcon = new L.Icon({
        iconUrl:
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
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

    useEffect(() => {
        setMarkers(
            data.map((trackerLocation: { time_stamp: string; gps: IGPSData }) =>
                trackerLocation.time_stamp.split('.')[0] === chosenTracker ? (
                    <Marker
                        key={trackerLocation.time_stamp}
                        icon={greenIcon}
                        position={[
                            trackerLocation.gps.lat,
                            trackerLocation.gps.lon,
                        ]}
                    >
                        <Popup>{trackerLocation.time_stamp}</Popup>
                    </Marker>
                ) : (
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
            )
        )

        // We can't add green or blue icon to dependencies as this will cause infinite rerendering
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, chosenTracker])

    const [polylines, setPolylines] = useState<any>([])

    useEffect(() => {
        let tempPolylines = []
        for (let _i = 0; _i < data.length - 1; _i++) {
            tempPolylines.push([data[_i], data[_i + 1]])
        }
        setPolylines(
            tempPolylines.map((x) => {
                return (
                    <Polyline
                        positions={[
                            [x[0].gps.lat, x[0].gps.lon],
                            [x[1].gps.lat, x[1].gps.lon],
                        ]}
                    />
                )
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
                {markers}
                {polylines}
            </Map>
        </div>
    )
}

export default HistoricTrackerMap
