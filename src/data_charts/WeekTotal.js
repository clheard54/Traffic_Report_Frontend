import React, {Component, Fragment} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
import { connect } from 'react-redux'
import LoaderHOC_ from '../HOCs/LoaderHOC'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'


class WeekTotal extends Component {
	state = {
		beginning: moment().clone().subtract(7, 'days'),
		ending: moment()
	}

	fillData = (color) => {
		let myData = this.props.current_course.responses.filter(response => moment(parseInt(response.day)) >= this.state.beginning && (moment(parseInt(response.day)) <= this.state.ending))
		
		let arr = []
		for (let i=0; i<8; i++){
			let point = {};
			point.label = `${moment(this.state.beginning).clone().add(i, 'days').format("MMM D")}`
			point.y = (myData.filter(resp => resp.answer == color).filter( resp => moment(parseInt(resp.day)).format("MMM D") == moment(this.state.beginning).clone().add(i, 'days').format("MMM D"))).length
			arr.push(point)	
		}
		return arr
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

        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", 
			title:{
				text: "Week's Traffic: Breakdown by Color",
			fontSize: 26
			},
			subtitles: [
				{
					text: `${moment(this.state.beginning).format("MMM D")} - ${moment(this.state.ending).format("MMM D")}`,
					fontSize: 22
				}
				],
			axisX: {
				title: `Date`,
				interval: 1,
				intervalType: 'day',
				// minimum: this.state.beginning,
				// maximum: this.state.ending,
			},
			axisY: {
				title: "Number of Responses",
				minimum: 0,
				interval: 1
			},
			legend: {
				horizontalAlign: "center",
				verticalAlign: "bottom",  // "top" , "bottom"
				fontSize: 15
			  },

			data: [
				{
					type: "column",
					showInLegend: true,
					legendText: "Utterly confused",
					color: "#EA4335",
					dataPoints: this.fillData('red')
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Little shaky",
					color: "rgb(248, 200, 54)",
					dataPoints: this.fillData('yellow')
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "I understand!",
					color: "#34A853",
					dataPoints: this.fillData('green')
				  }
			]
			  }
		return (
		<div style = {{'maxWidth': '95%'}}>
		<Fragment>
			<CanvasJSChart options = {options} />
			<button className="btn btn-outline-primary weekBack" onClick={this.weekBack}><h2>{back}</h2></button>
			<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button>
			<br></br>
		</Fragment> 
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


export default LoaderHOC_(connect(mapStateToProps)(WeekTotal))
