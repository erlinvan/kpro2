import React, { useEffect, useState } from 'react'
import { Map, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import './TrackerInfo.css'


import { IGPSData } from '../../Interfaces/ITrackers'


type props = {
    data: any
}

const HistoricTrackerMap = ({ data }: props) => {

    const [markers, setMarkers] = useState<any>([])

    useEffect(() => {
        setMarkers(
            data.map((trackerLocation: { time_stamp: string; gps: IGPSData }) => (
                <Marker
                    key={trackerLocation.time_stamp}
                    position={[
                        trackerLocation.gps.lat,
                        trackerLocation.gps.lon,
                    ]}
                >
                    <Popup>
                        {trackerLocation.time_stamp}
                    </Popup>
                </Marker>
            )),
        )
    }, [data])

    const [polylines, setPolylines] = useState<any>([])

    useEffect(() => {
        let tempPolylines = []
        for (let _i = 0; _i < data.length - 1; _i++) {
            tempPolylines.push([data[_i], data[_i + 1]])
        }
        setPolylines(
            tempPolylines.map((x) => {
                return <Polyline
                    positions={[
                        [x[0].gps.lat, x[0].gps.lon], [x[1].gps.lat, x[1].gps.lon],
                    ]}
                />
            }),
        )
    }, [data])

    return (
        <div>
            <Map center={[64.9139, 18.7522]} zoom={4.8} className="leaflet-container">
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
