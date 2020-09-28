import React, { useEffect, useState } from 'react'
import { Map, Marker, TileLayer } from 'react-leaflet'

import './SearchAndTableComponent.css'

type props = {
    data: any,
}

const TrackerMap = ({ data }: props) => {


    const [markers, setMarkers] = useState([])

    useEffect(() => {
        setMarkers(data.map((trackerLocation: { id: any; coordinates: any[] }) =>
            <Marker
                key={trackerLocation.id}
                position={[trackerLocation.coordinates[0], trackerLocation.coordinates[1]]}
                onClick={() => {
                    console.log(trackerLocation.id)
                }}
            />,
        ))
    }, [data])


    return (
        <div>
            <Map center={[64.9139, 18.7522]} zoom={4.8}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                {
                    markers
                }

            </Map>
        </div>
    )
}


export default TrackerMap
