import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux';
import { loadStudentResponses } from '../redux';
import { api } from '../services/api'
//var CanvasJSReact = require('./canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

let myData = []
class AllClasses extends Component {	
	
	componentDidUpdate(prevProps){
		if (prevProps.teachers_responses !== this.props.teachers_responses){
			myData = this.fillData()
		}
	}
	// computeAverage = () => {
	// 	let numerical = this.props.teachers_responses.filter(response => response.datatype == 'color').map(entry => {
	// 		return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
	// 	})
	// 	return numerical.reduce((a,b)=>a+b)/this.props.student_responses.length
	// }

	fillData = () => {
		const hash = {
			'red': 2,
			'yellow': 6,
			'green': 10
		}
		const matchColor = {
			'red': '#EA4335',
			'yellow': 'rgb(248, 200, 54)',
			'green': '#34A853'
		}
		myData = this.props.teachers_responses ? (this.props.teachers_responses.filter(response => response.datatype == 'light').map(response => (
			{
				label: response.day[0] == '0' ? response.day[1]+"/"+response.day.slice(2,4) : response.day.slice(0,2)+"/"+response.day.slice(1,4),
				x: parseFloat(response.day),
				y: hash[response.answer], 
				course: response.course,
				student: response.student,
				// z: 80*(Math.sqrt(2))^2,
                markerColor: matchColor[response.answer],
                markerSize: 45
			}
		))) : []
		return myData;
	}

    render() {
		
		const feeling = {
			2: "really confused",
			6: "shaky",
			10: "great!"
		}
		const n = Math.sqrt(2)
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Responses from All Classes",
			fontSize: 26
			},
			axisX: {
				title: 'Date',
				logarithmic: false,
				interval: 1,
				labelWrap: true,
				labelAngle: -45
			},
			axisY: {
				title: "Traffic Temperature",
				gridThickness: 2
			},
			data: [{
				type: "spline",
				// indexLabel: "{label}",
				toolTipContent: "<b>{label}</b><br>Date: {x}<br>Class: {course}<br>Student: {student}",
				indexLabelWrap: true,
				dataPoints: this.fillData()
			}]
		}
		return (
		<div>
			<CanvasJSChart id='indiv-data' options = {options} style={{'backgroundImage':"linear-gradient(green, yellow, red)", 'opacity': '0.2'}}
				/* onRef={ref => this.chart = ref} */
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
	}
}
	
const mapStateToProps = state => {
	return {
		teachers_responses: state.responses.teachers_responses
	}
}

export default connect(mapStateToProps)(AllClasses)