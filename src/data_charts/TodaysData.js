import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux'
import { currentCourse } from '../redux'
import * as moment from 'moment'
import { api } from '../services/api'
import LoaderHOC_ from '../HOCs/LoaderHOC'
//var CanvasJSReact = require('./canvasjs.react');
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'
let finalDataset

class TodaysData extends Component {
	state = {
		selectedDay: moment()
	}
	
	dayBack = () => {
		this.setState(prev => {
			return {
				selectedDay: moment(prev.selectedDay).subtract(1, 'day')
			}
		})
	}

	dayForward = () => {
		this.setState(prev => {
			return {
				selectedDay: moment(prev.selectedDay).add(1, 'day')
			}
		})
	}

	fillData = () => {
		let myData = []
        const n = Math.sqrt(2)
			let dataset = this.props.current_course.responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(this.state.selectedDay).format("MMM D"))
			let r = dataset.filter(resp => resp.answer == 'red').length
			let y = dataset.filter(resp => resp.answer == 'yellow').length
			let g = dataset.filter(resp => resp.answer == 'green').length
		myData = [
			{ label: "Red", x: moment(this.state.selectedDay), y: 2, z: 20*(n**r), markerColor: 'red', number: r, feeling: "Not good" },
			{ label: "Yellow", x: moment(this.state.selectedDay), y: 6, z: 20*(n**y), markerColor: 'rgb(248, 200, 54)', number: y, feeling: "Little shaky, mostly fine"},
			{ label: "Green", x: moment(this.state.selectedDay), y: 10, z: 20*(n**g), markerColor: '#34A853', number: g, feeling: "Confident"}
		]
	return myData
	}

    render() {
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", 
			title:{
				text: "Today's Bubble Chart",
			fontSize: 26
			},
			subtitles: [{
				text: `${moment(this.state.selectedDay).format("MMM Do")}`,
				fontSize: 22
			}],
			axisX: {
				title: `Date - ${moment(this.state.selectedDay).format("dddd")}`,
				valueFormatString: 'MMM D'
			},
			axisY: {
				title: "Traffic Temperature",
				viewportMinimum: 0,
        		viewportMaximum: 12
			},
			data: [{
				type: "bubble",
				xValueType: "dateTime",
				indexLabel: "{label}",
				valueFormatString: "DDDD",
				legendMarkerType: "circle",
				toolTipContent: "<b>{label}</b><br>Understanding: {feeling}<br>Number of Responses: {number}",
				dataPoints: this.fillData()
			}]
		}
		return (
		<div>
			<CanvasJSChart options = {options}
				/* onRef={ref => this.chart = ref} */
			/>
			<button className="btn btn-outline-primary weekBack" onClick={this.dayBack}><h4>{back}</h4></button>
			<button className="btn btn-outline-primary weekForward" onClick={this.dayForward}><h4>></h4></button>
			<br></br> 
		</div>
		);
	}
}
	
const mapStateToProps = state => {
    return {
        current_course: state.courses.current_course,
        class_responses: state.responses.class_responses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default LoaderHOC_(connect(mapStateToProps, mapDispatchToProps)(TodaysData))