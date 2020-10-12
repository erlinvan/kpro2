import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ICharts } from '../../Interfaces/IChart'

const Charts = (props: ICharts) => {
    const options = {
        chart: {
            type: 'line',
        },
        title: {
            text: props.data.type,
        },
        xAxis: {
            categories: props.data.timestamp,
        },
        series: [
            {
                data: props.data.yAxis,
            },
        ],
    }

    return (
        <>
            <HighchartsReact highcharts={Highcharts} options={options} />
        </>
    )
}

export default Charts
