export interface IFetchTrackers {
    trackers: ITrackers[]
}

export interface ITrackers {
    id: string
    timestamp: string
    gps: IGPSData
}

export interface IGPSData {
    lon: any
    lat: any
}
