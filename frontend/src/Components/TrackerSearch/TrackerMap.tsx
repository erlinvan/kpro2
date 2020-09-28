import React from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import { Icon } from 'leaflet'
import './SearchAndTableComponent.css'


const TrackerMap = () => {

    return (
        <div>
            <Map  center={[59.9139, 10.7522]} zoom={6}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
            </Map>
        </div>
    )
}


export default TrackerMap;