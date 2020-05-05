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
		beginning: moment().clone().subtract(7, 'days').toDate(),
		ending: moment().clone().toDate(),
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


	fillData = (course) => {
		if (!!course.id){
		let myData = course.responses.filter(response => response.datatype == 'light')
		.filter(response => (moment(parseInt(response.day)) >= moment(this.state.beginning)) && (moment(parseInt(response.day)) <= moment(this.state.ending)))

	//seven times, filter by date and take average
		let arr = []
		for (let i=0; i<8; i++){
			let week_day = moment(this.state.beginning).clone().add(i, 'days')
			let point = {};
			point.label = `${week_day.format("MMM D")}`
			point.x = week_day.toDate()
			point.date = week_day.format("dddd")
			point.y = parseFloat(this.computeAverage(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D"))))
			point.responses = (myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D"))).length
			point.reds = this.findReds(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D")))
			// if (!!this.computeAverage(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D")))) {
			// 	total += point.y
			// 	counter += 1
			// } 
			arr.push(point)
			}
		return arr
	}}

	findReds = (arr) => {
        let allReds = []
		let reds = arr.filter(entry => entry.answer == 'red').map(entry => entry.student_id)
            reds.forEach(id => {
				let toAdd = this.props.current_course.students
				.find(student => student.id == id)
                if (!allReds.includes(toAdd.name)){
                    allReds.push(toAdd.name)
                }
            })
        if (allReds.length == 0){
            return <i>None recorded</i>
        } else {
            return allReds.join(', ')
        }
    }


    computeAverage = (daysResponses) => {
      if (daysResponses.length !==0 ){
      let numerical = daysResponses.map(entry => {
        return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
      })
	  let avg = (numerical.reduce((a,b)=>a+b)/daysResponses.length).toFixed(1)
	  return avg
	  } else { return 0}
	}

    	
	render() {
        const options = {
			backgroundColor: "transparent",
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", 
			title:{
				text: "Daily Averages",
			fontSize: 26
			},
			subtitles: [
				{text: `Week of ${moment(this.state.beginning).format("MMM D")} - ${moment(this.state.ending).format("MMM D")}`,
				fontSize: 22}
			],
			axisX: {
				title: `Date`,
				intervalType: 'day',
				interval: 1,
				valueFormatString: "MMM D",
				minimum: this.state.beginning,
				maximum: this.state.ending,

			},
			axisY: {
				title: "Traffic Temperature",
				minimum: 0,
        		maximum: 12
			},
			data: [{
				type: "spline",
				lineColor: 'black',
				xValueType: 'dateTime',
				markerType: "circle",
				type: "line",
				connectNullData: true,
				toolTipContent: "<b>{label}</b><br>Date: {date}<br>Number of Responses: {responses}<br>Day's Average: {y}<br>Reds: {reds}",
				dataPoints: this.fillData(this.props.current_course)
			}]
		}
		return (
		<div>
		<Fragment>
			<CanvasJSChart id="chartContainer" options = {options}	/>
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
        user_courses: state.courses.user_courses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WeekAvgs)