import React, { useEffect, useState } from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
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

    return (
        <div>
            <Map center={[64.9139, 18.7522]} zoom={4.8} className="leafletContainer">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {markers}
            </Map>
        </div>
    )
}


export default HistoricTrackerMap
