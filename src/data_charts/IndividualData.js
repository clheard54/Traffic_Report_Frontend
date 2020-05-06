import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
import { connect } from 'react-redux';
import LoaderHOC_ from '../HOCs/LoaderHOC'
// var CanvasJS = CanvasJSReact.CanvasJS;
const back = '<'
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

let myWeeksData = []
class IndividualData extends Component {	
	state = {
		beginning: moment().clone().subtract(7, 'days').toDate(),
		ending: moment().clone().toDate()
	}


	weekBack = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.beginning).subtract(7, 'days').toDate(),
				ending: moment(prev.beginning)
			})
	    }, () => {this.props.changeDates(this.state.beginning, this.state.ending)})
	}	
	
	weekForward = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.ending),
				ending: moment(prev.ending).add(7, 'days').toDate()
			})
	    }, () => {this.props.changeDates(this.state.beginning, this.state.ending)})
	}

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
			'red': "Really confused :(",
			'yellow': "Shaky :/",
			'green': "Great! :)"
		}
		const n = Math.sqrt(2)
		const allMyData = this.props.current_course.responses.map(resp => resp.student_id == this.props.current_user.id ? resp : null).filter(e => e!==null)
		
		if (allMyData.length !== 0){
			myWeeksData = allMyData
			.filter(response => (moment(parseInt(response.day)) >= moment(this.state.beginning)) && (moment(parseInt(response.day)) <= moment(this.state.ending)))
			.map(response => (
				{
					label: moment(parseInt(response.day)).format("dddd"),
					date: moment(parseInt(response.day)).format("MMM Do"),
					x: moment(parseInt(response.day)),
					y: hash[response.answer], 
					z: 4,
					feeling: feeling[response.answer],
					markerColor: matchColor[response.answer],
				}
			));
		}
		let arr = []
		for (let i=0; i<8; i++){
			let point = {};
			point.x = `${moment(this.state.beginning).clone().add(i, 'days').format("MMM D")}`;
			point.y = 0
			point.z = Math.random()*10
			arr.push(point)	
		}
		let finalData = myWeeksData.concat(arr)
		
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", 
			title:{
				text: "Your Understanding",
			fontSize: 26
			},
			axisX: {
				title: 'Date',
				labelWrap: true,
				valueFormatString: "MMM D",
				interval: 1,
				intervalType: 'day',
				minimum: this.state.beginning,
				maximum: this.state.ending
			},
			axisY: {
				title: "Traffic Temperature",
				gridThickness: 2,
				minimum: 0,
				maximum: 12
			},
			data: [{
				type: "bubble",
				xValueType: "dateTime",
				// indexLabel: "{label}",
				toolTipContent: "<b>{label}</b><br>Date: {date}<br>Traffic Temperature: {y}<br>Feeling: {feeling}",
				indexLabelWrap: true,
				dataPoints: finalData
			}]
		}
		return (
		<div>
			<CanvasJSChart id='indiv-data' options = {options} style={{'backgroundImage':"linear-gradient(green, yellow, red)", 'opacity': '0.2'}}
			/>
			<button className="btn btn-outline-primary weekBack" onClick={this.weekBack}><h2>{back}</h2></button>
			<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button>
			<br></br>
		</div>
		);
	}
}
	
const mapStateToProps = state => {
	return {
		current_user: state.auths.current_user,
		current_course: state.courses.current_course,
	}
}


export default LoaderHOC_(connect(mapStateToProps)(IndividualData));