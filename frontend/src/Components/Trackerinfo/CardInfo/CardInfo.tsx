import { CardContent, Grid, Typography } from '@material-ui/core'
import React from 'react'

interface IProps {
    value: string
    parameter: string
}

const CardInfo = ({ value, parameter }: IProps) => {
    return (
        <Grid item xs={4}>
            <CardContent>
                <Typography variant="body2" component="h2">
                    <b>{parameter}:</b> {value}
                </Typography>
            </CardContent>
        </Grid>
    )
}

export default CardInfo
