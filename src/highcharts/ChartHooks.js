import React, { Component } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import * as moment from 'moment';
  import _ from 'lodash';

// receives parseInt(response.day) from backend as 1588263441461.197 
// can convert to date in js with new Date(parseInt(resp.day)) --> 2020-04-23T16:12:13.000Z

// 604800000 seconds in a week (anything within that margin gets pulled into week data chart)

// 
const LineChart = () => {
    const [hoverData, setHoverData] = useState(null);
    const [chartOptions, setChartOptions] = useState({
      xAxis: {
        categories: ['A', 'B', 'C'],
      },
      series: [
        { data: [1, 2, 3] }
      ],
      plotOptions: {
        series: {
          point: {
            events: {
              mouseOver(e){
                setHoverData(e.target.category)
              }
            }
          }
        }
      }
    });
  

    const updateSeries = () => {
      setChartOptions({ 
        series: [
            { data: [Math.random() * 5, 2, 1]}
          ]
      });
    }
  
    return (
        <div>
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
          />
          <h3>Hovering over {hoverData}</h3>
          <button onClick={updateSeries}>Update Series</button>
        </div>
      )
  }