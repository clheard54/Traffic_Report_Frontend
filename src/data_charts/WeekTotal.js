import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

// Grab every response from this course for the past 5 days. Each one gets plotted. All same diameter. Label with names?

class WeekTotal extends Component {	
	constructor() {
		super();
		this.state = {
			datapoints: []
		}
	}

	
	// componentDidUpdate(prevProps){
	// 	if (prevProps.teachers_responses !== this.props.teachers_responses || prevProps.current_course !== this.props.current_course){
	// 		if (this.props.teachers_responses !== []){
	// 		this.addAllData()
	// 		}
	// 	}
	// 	}

	// addAllData = () => {
	// 	const red = this.props.teachers_responses.filter(resp => resp.answer == 'red')
	// 	const yellow = this.props.teachers_responses.filter(resp => resp.answer == 'yellow')
	// 	const green = this.props.teachers_responses.filter(resp => resp.answer == 'green');

	// 	let myData = [
	// 		{
	// 			type: "column",
	// 			showInLegend: true,
	// 			legendText: "Yikes",
	// 			color: "red",
	// 			dataPoints: this.fillData(red)
	// 		  },
	// 		  {
	// 			type: "column",
	// 			showInLegend: true,
	// 			legendText: "Meh",
	// 			color: "yellow",
	// 			dataPoints: this.fillData(yellow)
	// 		  },
	// 		  {
	// 			type: "column",
	// 			showInLegend: true,
	// 			legendText: "Yahoo",
	// 			color: "green",
	// 			dataPoints: this.fillData(green)
	// 		  }
	// 	]
	// 	this.setState({
	// 		datapoints: myData
	// 	}) 
	// }
	

	fillData = (color) => {
		const date = new Date()
		const today = date.toDateString().slice(4,10)
		date.setDate(date.getDate()-7)
		const weekago = date.toDateString().slice(4,10)
		const ordered = this.props.teachers_responses.sort((a,b) => (a.day < b.day) ? 1 : -1)
		let arr = []
		for (let i=0; i<7; i++){
			let point = {};
			point.label = weekago.slice(0,4) + ' ' + parseInt(weekago.slice(8)+i)
			point.y = (color.filter( resp => Math.abs(parseInt(resp.day) - parseInt(ordered[0].day))<1 )).length
		arr.push(point)	
		}
		return arr
	}
	
	
	render() {
		const red = this.props.teachers_responses.filter(resp => resp.answer == 'red')
		const yellow = this.props.teachers_responses.filter(resp => resp.answer == 'yellow')
		const green = this.props.teachers_responses.filter(resp => resp.answer == 'green');

		const date = new Date()
		const today = date.toDateString().slice(4,10)
		date.setDate(date.getDate()-7)
		const weekago = date.toDateString().slice(4,10)
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Past Week's Traffic",
			fontSize: 26
			},
			axisX: {
				title: `Past Week: ${weekago} - ${today}`,
			logarithmic: false
			},
			axisY: {
				title: "Traffic Temperature"
			},

			data: [
				{
					type: "column",
					showInLegend: true,
					legendText: "Red",
					color: "#EA4335",
					dataPoints: this.fillData(red)
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Yellow",
					color: "rgb(248, 200, 54)",
					dataPoints: this.fillData(yellow)
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Green",
					color: "#34A853",
					dataPoints: this.fillData(green)
				  }
			]
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
	

const mapStateToProps = state => {
    return {
        current_user: state.auths.current_user,
        current_course: state.courses.current_course,
        user_courses: state.courses.user_courses,
        teachers_responses: state.responses.teachers_responses
    }
}

export default connect(mapStateToProps)(WeekTotal)