import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux';
import { loadStudentResponses } from '../redux';
import { api } from '../services/api'
//var CanvasJSReact = require('./canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

let student_responses
let numerical
class IndividualData extends Component {	
	state = {
		avg: 0
	}
	
	// fetch recent responses based on current_user
	// componentDidMount(){
	// 	student_responses = this.props.current_course.responses.map(resp => resp.student_id == this.props.current_user.id ? resp : null).filter(e => e!==null)
	// 	this.computeAverage()
	// }

	// componentDidUpdate(prevProps){
	// 	if (prevProps.current_course !== this.props.current_course){
	// 		this.computeAverage()
	// 	}
	// }

	// computeAverage = () => {
	// 	numerical = student_responses.filter(response => response.datatype == 'light').map(entry => {
	// 		return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
	// 	})
	// 	this.setState({
	// 		avg: numerical.reduce((a,b)=>a+b)/student_responses.length
	// 	})
	// }

    render() {
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
		const feeling = {
			2: "really confused",
			6: "shaky",
			10: "great!"
		}
		const n = Math.sqrt(2)
		const myData = this.props.current_course.responses.map(resp => resp.student_id == this.props.current_user.id ? resp : null).filter(e => e!==null).map(response => (
			{
				label: response.day[0] == '0' ? response.day[1]+"/"+response.day.slice(2,4) : response.day.slice(0,2)+"/"+response.day.slice(1,4),
				x: parseFloat(response.day),
				y: hash[response.answer], 
				z: 80*n^2,
				markerColor: matchColor[response.answer],
			}
		));
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Your Understanding",
			fontSize: 26
			},
			axisX: {
				title: 'Date',
				logarithmic: false,
				interval: 0.5,
				labelWrap: true,
				labelAngle: -45
			},
			axisY: {
				title: "Traffic Temperature",
				gridThickness: 2
			},
			data: [{
				type: "bubble",
				// indexLabel: "{label}",
				toolTipContent: "<b>{label}</b><br>Date: {x}<br>Traffic Temperature: {y}<br>Feeling: {feeling[z]}",
				indexLabelWrap: true,
				dataPoints: myData
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
		current_user: state.auths.current_user,
		current_course: state.courses.current_course,
		student_responses: state.responses.student_responses
	}
}

const mapDispatchToProps = dispatch => {
	return {
		getStudentResponses: (id) => loadStudentResponses(id)(dispatch)	
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(IndividualData)