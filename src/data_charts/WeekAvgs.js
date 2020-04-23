import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

// Only difference from TodaysData may be that we are now pulling 5 days' worth of responses, and building 5 columns.

export default class WeekAvgs extends Component {	
    render() {
        const n = Math.sqrt(2)
        const today = new Date().toDateString().slice(4)
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Todays' Bubble Chart",
			fontSize: 26
			},
			axisX: {
				title: `Today - ${today}`,
			logarithmic: false
			},
			axisY: {
				title: "Traffic Temperature"
			},
			data: [{
				type: "bubble",
				indexLabel: "{label}",
				toolTipContent: "<b>{label}</b><br>Date: {x}<br>Traffic Temperature: {y}<br>Diameter: {z} number",
				dataPoints: [
					{ label: "Red", x: 1, y: 10, z: 80*n^2, color: 'red' },
					{ label: "Yellow", x: 1, y: 20, z: 80*n^4, color: 'yellow'},
					{ label: "Green", x: 1, y: 30, z: 80*n^1, color: 'green'}
					// { label: "Aiden", x: 1, y: 10, z: 100 },
					// { label: "Kailana", x: 1, y: 20, z: 100 },
					// { label: "Chris", x: 1, y: 20, z: 100 },
					// { label: "Jack", x: 1, y: 20, z: 100 },
					// { label: "Kim", x: 1, y: 30, z: 100 },
				]
			}]
		}
		return (
		<div>
			<CanvasJSChart options = {options}
				/* onRef={ref => this.chart = ref} */
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
	}
}
    