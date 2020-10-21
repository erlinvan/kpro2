export interface IFetchTrackers {
    trackers: ITrackers[]
}

export interface ITrackers {
    id: string
    timestamp: string
    gps: IGPSData
    company: string
}

export interface IGPSData {
    lon: any
    lat: any
}
