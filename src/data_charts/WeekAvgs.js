import React, {Component, Fragment } from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
import { currentCourse } from '../redux'
import { api } from '../services/api'
import { connect } from 'react-redux'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'
let total = 0; let counter = 0;

class WeekAvgs extends Component {	
	state = {
		loading: true,
		current_course: this.props.current_course,
	}

	componentDidMount(){
		if (!this.props.current_course.id) {
			try {
				const current_course = localStorage.getItem('course_token');
				if ('course_token' == null) {
					return undefined;
				}
				api.getRequests.getCourses().then(data => {
					let thisCourse = data.filter(course => course.id == parseInt(current_course));
					this.props.setCurrentCourse(thisCourse[0])
					this.setState({
						loading: false,
						current_course: thisCourse[0]
					})
				})
				} catch (err) {
				this.props.history.push("/profile");
				}
			} 
		let now = moment()
		this.setState({
			beginning: now.clone().subtract(8, 'days').toDate(),
			ending: now.clone().add(1, 'day').toDate()
		})
	}
              
	
	weekBack = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.beginning).subtract(7, 'days').toDate(),
				ending: moment(prev.beginning).add(1, 
					'day')
			})
	    })
	}
	
	weekForward = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.ending).subtract(1, 'day'),
				ending: moment(prev.ending).add(7, 'days').toDate()
			})
	    })
	}


	fillData = (course) => {
		if (!!course.id){
		let myData = course.responses.filter(response => response.datatype == 'light')
		.filter(response => (moment(parseInt(response.day)) >= moment(this.state.beginning)) && (moment(parseInt(response.day)) <= moment(this.state.ending)))

	//seven times, filter by date and take average
		let arr = []
		for (let i=0; i<7; i++){
			let point = {};
			point.label = `${moment(this.state.ending).clone().add(i-7, 'days').format("MMM D")}`
			point.x = moment(this.state.beginning).clone().add(i, 'days').toDate()
			point.date = moment(this.state.beginning).clone().add(i, 'days').format("dddd")
			point.y = parseFloat(this.computeAverage(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == moment(this.state.ending).clone().add(i-7, 'days').format("MMM D"))))
			if (!!this.computeAverage(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == moment(this.state.ending).clone().add(i-7, 'days').format("MMM D")))) {
				total += point.y
				counter += 1
			} 
			arr.push(point)
			}
		return arr
	}}

    computeAverage = (daysResponses) => {
      if (daysResponses.length !==0 ){
      let numerical = daysResponses.map(entry => {
        return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
      })
	  let avg = (numerical.reduce((a,b)=>a+b)/daysResponses.length).toFixed(1)
	  return avg
	} else { return null}
}
    	
	render() {
        const n = Math.sqrt(2)
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", 
			title:{
				text: "Daily Averages",
			fontSize: 26
			},
			subtitles: [
				{text: `Week of ${moment().clone().subtract(7, 'days').format("MMM D")} - ${moment().clone().format("MMM D")}`,
				fontSize: 22}
			],
			axisX: {
				title: `Date`,
				intervalType: 'day',
				interval: 1,
				valueFormatString: "MMM D"

			},
			axisY: {
				title: "Traffic Temperature",
				viewportMinimum: 0,
        		viewportMaximum: 10
			},
			data: [{
				type: "spline",
				xValueType: 'dateTime',
				markerType: "circle",
				type: "line",
				connectNullData: true,
				toolTipContent: "<b>{label}</b><br>Date: {date}<br>Day's Average: {y}<br>",
				dataPoints: this.fillData(this.props.current_course)
			}]
		}
		return (
		<div>
		<Fragment>
			<CanvasJSChart options = {options}	/>
			{this.props.setWeekAvg((total/counter).toFixed(1))}
			<button className="btn btn-outline-primary" style={{'position': 'absolute', 'left': '20%'}} onClick={this.weekBack}><h2>{back}</h2></button>
			<button className="btn btn-outline-primary" style={{'position': 'absolute', 'right': '23%'}} onClick={this.weekForward}><h2>></h2></button>
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
        user_courses: state.courses.user_courses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WeekAvgs)