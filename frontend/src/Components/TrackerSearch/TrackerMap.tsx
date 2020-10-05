import React, { useEffect, useState } from 'react'
import { Map, Marker, TileLayer } from 'react-leaflet'
import { IGPSData, ITrackers } from '../../Interfaces/ITrackers'
import './SearchAndTableComponent.css'

type props = {
    data: ITrackers[]
}

const TrackerMap = ({ data }: props) => {
    const [markers, setMarkers] = useState<any>([])

    useEffect(() => {
        setMarkers(
            data.map((trackerLocation: { id: string; gps: IGPSData }) => (
                <Marker
                    key={trackerLocation.id}
                    position={[
                        trackerLocation.gps.lat,
                        trackerLocation.gps.lon,
                    ]}
                    onClick={() => {
                        console.log(trackerLocation.id)
                    }}
                />
            ))
        )
    }, [data])

    return (
        <div>
            <Map center={[64.9139, 18.7522]} zoom={4.8}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {markers}
            </Map>
        </div>
    )
}

export default TrackerMap
