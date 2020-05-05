import React, {Component, Fragment} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
import { connect } from 'react-redux'
import { currentCourse } from '../redux'
import { api } from '../services/api'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'


let myData = []
class WeekTotal extends Component {
	state = {loading: true}

	componentDidMount() {
		if (!!this.props.current_course.id){
			let now = moment()
		this.setState({
			beginning: now.clone().subtract(7, 'days').toDate(),
			ending: now.clone().toDate(),
			loading: false
		})
		}
	}

	componentDidUpdate(prev){
		if (prev.current_course !== this.props.current_course){
			let now = moment()
		this.setState({
			beginning: now.clone().subtract(7, 'days').toDate(),
			ending: now.clone().toDate(),
			loading: false
		})
		}
	}


	fillData = (dataset, color) => {
		myData = this.props.current_course.id && dataset ? (dataset.filter(response => response.datatype == 'light').filter(response => (moment(parseInt(response.day)) >= moment(this.state.beginning)) && (moment(parseInt(response.day)) <= moment(this.state.ending)))) : []
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
				text: "Week's Traffic:",
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
				minimum: this.state.beginning,
				maximum: this.state.ending,
			},
			axisY: {
				title: "Traffic Temperature",
				minimum: 0,
				maximum: 12
			},

			data: [
				{
					type: "column",
					showInLegend: true,
					legendText: "Red",
					color: "#EA4335",
					dataPoints: this.fillData(this.props.current_course.responses,'red')
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Yellow",
					color: "rgb(248, 200, 54)",
					dataPoints: this.fillData(this.props.current_course.responses, 'yellow')
				  },
				  {
					type: "column",
					showInLegend: true,
					legendText: "Green",
					color: "#34A853",
					dataPoints: this.fillData(this.props.current_course.responses, 'green')
				  }
			]
			  }
		return (
		<div>
		{this.state.loading ? null :
		<Fragment>
			<CanvasJSChart options = {options}	/>
			<button className="btn btn-outline-primary weekBack" onClick={this.weekBack}><h2>{back}</h2></button>
			<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button>
			<br></br>
		</Fragment> }
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

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WeekTotal)
