import React from 'react'

export default class TriageChart extends React.Component{
    render(){
        return (
          <div>
            <table style={{width:"100%"}}>
                <tr>
                    <th>HAVE NOT ANSWERED: </th>
                    <td>Bill Gates</td>
                </tr>
                <tr>
                    <th>RED LIGHT: </th>
                    <td>555 77 854</td>
                </tr>
                <tr>
                    <th>YELLOW:</th>
                    <td>555 77 855</td>
                </tr>
                <tr>
                    <th>GREEN:</th>
                    <td>555 77 855</td>
                </tr>
            </table>
          </div>
        )
    }
}