import React, {Component, Fragment } from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
import { currentCourse } from '../redux'
import { connect } from 'react-redux'
import LoaderHOC_ from '../HOCs/LoaderHOC'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'
let avgs=[]
let maxColor; let minColor

class WeekAvgs extends Component {	
	state = {
		avgs: [],
		beginning: moment().clone().subtract(7, 'days').toDate(),
		ending: moment().clone().toDate(),
		current_course: this.props.current_course,
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
	

	fillData = () => {
		let myData = this.props.current_course.responses.filter(response => response.datatype == 'light')
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
			if (!!point.y){
				avgs.push(point.y)
			}
			arr.push(point)
			}
		return arr
	}

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
	  } else { return null}
	}

	
	calculateHigh = () => {
		let high = Math.max(...avgs)
		if (high <= 4){
			maxColor = 'red'
		} else if (high > 4 && high < 7.5){
			maxColor = 'yellow'
		} else{
			maxColor = 'green'
		} 
		return high
	}

	calculateLow = () => {
		let low = Math.min(...avgs)
		if (low <= 4){
			minColor = 'red'
		} else if (low > 4 && low < 7.5){
			minColor = 'yellow'
		} else{
			minColor = 'green'
		} 
		return low
	}

	goBack = () => {
		localStorage.setItem('course_token', this.props.current_course.id)
		this.props.setCurrentCourse(this.props.current_course);
		this.props.history.push('/current_course')
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
				dataPoints: this.fillData()
			}]
		}
		return (
			<Fragment>
		  <div className="row flex-row">
		  <div className='col-sm-1'></div>
			  <div className ="col-md-8">
				<div className="week-avgs">
					<CanvasJSChart id="chartContainer" options = {options}	/>
					<button className="btn btn-outline-primary weekBack" onClick={this.weekBack}><h2>{back}</h2></button>
					<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button>
			    </div>
				<br></br><br></br>
			  </div>
			<div className='col-md-3'>
				<div style={{'display': 'flex', 'flexDirection': 'column'}}>
				<div className='container' style={{'marginTop': '100px'}}>
					<div className={`aa btn ${maxColor}`}>
						<span style={{'color': '#343a40'}}>Week's High:  {this.calculateHigh()}</span>
					</div>
					<br></br><br></br>
					<div className={`aa btn ${minColor}`}>
						<span style={{'color': '#343a40'}}>Week's Low:  {this.calculateLow()}</span>
					</div>
					<br></br><br></br><br></br><br></br>
					<a className='btn btn-outline-danger aa' onClick={() => this.setCourse(this.props.current_course)} href="/courses/current">Go Back</a>
			  </div>
			</div>
			</div>
			<br></br><br></br>
				
			</div><br></br> 
		</Fragment>
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

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default LoaderHOC_(connect(mapStateToProps, mapDispatchToProps)(WeekAvgs))