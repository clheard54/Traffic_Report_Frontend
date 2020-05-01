import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
//var CanvasJSReact = require('./canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

export default class TodaysData extends Component {
	
	fillData = () => {
		const myData = []
        const n = Math.sqrt(2)
		const date = new Date()
		if (this.props.class_responses !== undefined){
			let dataset = this.props.class_responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
			let r = dataset.filter(resp => resp.answer == 'red').length
			let y = dataset.filter(resp => resp.answer == 'yellow').length
			let g = dataset.filter(resp => resp.answer == 'green').length
		myData = [
			{ label: "Red", x: 1, y: 10, z: 80*n^r, color: 'red' },
			{ label: "Yellow", x: 1, y: 20, z: 80*n^y, color: 'yellow'},
			{ label: "Green", x: 1, y: 30, z: 80*n^g, color: 'green'}
		]
	}
	return myData
	}
    render() {
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Todays' Bubble Chart",
			fontSize: 26
			},
			axisX: {
				title: `Today - ${moment().format("MMMM Do")}`,
			logarithmic: false
			},
			axisY: {
				title: "Traffic Temperature"
			},
			data: [{
				type: "bubble",
				xValueType: "dateTime",
				indexLabel: "{label}",
				toolTipContent: "<b>{label}</b><br>Date: {x}<br>Traffic Temperature: {y}<br>Diameter: {z} number",
				dataPoints: this.fillData()
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
    