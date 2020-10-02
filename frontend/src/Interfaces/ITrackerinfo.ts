export interface ITrackerinfo {
    beacon_data: IBeacondata[]
    company_owner: string
    id: string
}

export interface IBeacondata {
    beaconID: string
    description: string
    humidity: string
    temperature: string
    timestamp: string
}
