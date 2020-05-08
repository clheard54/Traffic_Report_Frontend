import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux';
import * as moment from 'moment'
import LoaderHOC_ from '../HOCs/LoaderHOC'
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'

class WeekBubble extends Component {	
	constructor(){
		super();
		this.state = {
			beginning: moment().clone().subtract(7, 'days'),
			ending: moment().clone(),
		}
	}

	weekBack = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.beginning).subtract(7, 'days').toDate(),
				ending: moment(prev.beginning)
			})
	    })
	}
	
	weekForward = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.ending),
				ending: moment(prev.ending).add(7, 'days').toDate()
			})
	    })
	}

	weekFilter = (dataset) => {
		return dataset.filter(response => moment(parseInt(response.day)) >= moment(this.state.beginning))
		.filter(response => moment(parseInt(response.day)) <= moment(this.state.ending))
	}

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

		const feeling = {
			'red': "really confused",
			'yellow': "shaky",
			'green': "great!"
		}
		
		let myData = this.weekFilter(this.props.current_course.responses).map(response => (
			{
			label: moment(parseInt(response.day)).format("dddd"),
			date: moment(parseInt(response.day)).format("MMM Do"),
			x: moment(parseInt(response.day)).toDate(),
			y: hash[response.answer],
			student: this.props.current_course.students.find(kid => kid.id == response.student_id).name,
			feeling: feeling[response.answer],
			// z: 80*(Math.sqrt(2))**2,
			markerColor: matchColor[response.answer],
			markerSize: 35
		}
		))
		let arr = []
		for (let i=0; i<8; i++){
			let point = {};
			point.x = `${moment(this.state.beginning).clone().add(i, 'days').format("MMM D")}`;
			point.y = 0.1
			point.z = 0
			arr.push(point)	
		}
		return myData.concat(arr);
	}

    render() {
	
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2",
			title:{
				text: "Weekly Traffic Report",
			fontSize: 26
			},
			subtitles: [{
				text: `Week of ${moment(this.state.beginning).clone().format("MMM D")} - ${moment(this.state.ending).format("MMM D")}`,
				fontSize: 22
			}],
			axisX: {
				title: '\n Date',
				interval: 1,
				intervalType: 'day',
				minimum: this.state.beginning,
				maximum: this.state.ending,
                labelWrap: true,
                valueFormatString: "MMM D",
			},
			axisY: {
				title: "Traffic Temperature",
				gridThickness: 2,
				viewportMinimum: 0,
				viewportMaximum: 12
			},
			data: [{
				type: "scatter",
				fillOpacity: 0.7,
				xValueType: "dateTime",
				toolTipContent: "<b>{label}</b><br>Date: {date}<br>Class: {course}<br>Student: {student}",
				indexLabelWrap: true,
				dataPoints: this.fillData()
			}]
		}
		return (
			<div className="flex-row" style={{'alignItems':'center', 'marginTop': '20px'}}>
                {/* <div className='col-md-1'></div> */}
				<br></br><br></br><br></br><br></br>
                <div className='col-md-12' style={{'marginRight': '5px'}}>
				<CanvasJSChart options = {options}	/>
				<br></br>
				{/* <button className="btn btn-outline-primary" style={{'position': 'absolute', 'left': '25%'}} onClick={this.weekBack}><h2>{back}</h2></button>
				<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button> */}
                </div>
                <br></br>
			</div>
		);
	}
}
	
const mapStateToProps = state => {
	return {
		current_course: state.courses.current_course,
		user_courses: state.courses.user_courses
	}
}


export default LoaderHOC_(connect(mapStateToProps)(WeekBubble))