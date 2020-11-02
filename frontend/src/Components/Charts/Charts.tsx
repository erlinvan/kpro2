import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { ICharts } from '../../Interfaces/IChart'

interface chartProps {
    data: ICharts
    setChosenTracker: any
}

const Charts = (props: chartProps) => {
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
        plotOptions: {
            series: {
                point: {
                    events: {
                        click: function (e: any) {
                            props.setChosenTracker(e.point.category)
                        },
                    },
                },
            },
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
