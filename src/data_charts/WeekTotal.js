import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
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
	// 	if (prevProps.current_course !== this.props.current_course){
	// 		red = this.props.current_course.responses.filter(resp => resp.answer == 'red')
	// 		yellow = this.props.current_course.responses.filter(resp => resp.answer == 'yellow')
	// 		green = this.props.current_course.responses.filter(resp => resp.answer == 'green');
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
		let myData = this.props.current_course.id ? (this.props.current_course.responses.filter(response => response.datatype == 'light').filter(response => (moment(parseInt(response.day)) >= moment(moment().format())) && (moment(parseInt(response.day)) <= moment()))) : []
		let arr = []
		for (let i=0; i<7; i++){
			let point = {};
			point.label = `${moment().clone().add(i-7, 'days').format("MMM D")}`
			point.y = (color.filter( resp => moment(parseInt(resp.day)).format("MMM D") == moment().clone().add(i-7, 'days').format("MMM D"))).length
			arr.push(point)	
		}
		return arr
	}
	
	
	render() {
		// const red = this.props.current_course.responses.filter(resp => resp.answer == 'red')
		// const yellow = this.props.current_course.responses.filter(resp => resp.answer == 'yellow')
		// const green = this.props.current_course.responses.filter(resp => resp.answer == 'green');
		const now = moment()

        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Past Week's Traffic",
			fontSize: 26
			},
			axisX: {
				title: `Past Week: ${now.clone().subtract(7, 'days').format("MMM D")} - ${now.clone().format("MMM D")}`,
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
					dataPoints: this.fillData(this.props.current_course.responses.filter(resp => resp.answer == 'red'))
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Yellow",
					color: "rgb(248, 200, 54)",
					dataPoints: this.fillData(this.props.current_course.responses.filter(resp => resp.answer == 'yellow'))
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Green",
					color: "#34A853",
					dataPoints: this.fillData(this.props.current_course.responses.filter(resp => resp.answer == 'green'))
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