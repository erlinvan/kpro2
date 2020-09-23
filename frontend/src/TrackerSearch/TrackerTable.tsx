import React from 'react';
import data from './mockData/data.json'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';


const TrackerTable = () => {


    return (
        <TableContainer component={Paper}>
            <Table aria-label="simple table" >
                <TableHead>
                    <TableRow>

                        <TableCell align="right">ID</TableCell>
                        <TableCell align="right">Time Stamp</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row.id}>

                            <TableCell align="right">{row.id}</TableCell>
                            <TableCell align="right">{row.timeStamp}</TableCell>

                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )

}

export default TrackerTable;