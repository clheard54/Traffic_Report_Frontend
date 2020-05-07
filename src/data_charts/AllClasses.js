import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux';
import * as moment from 'moment'
import AuthHOC from '../HOCs/AuthHOC'
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'
let allData = []
let student; let course

class AllClasses extends Component {	
	constructor(){
		super();
		this.state = {
			beginning: moment().clone().subtract(7, 'days'),
			ending: moment().clone(),
			detail: false
		}
	}

	componentDidMount(){
		let now = moment()
		this.setState({
			beginning: now.clone().subtract(7, 'days').toDate(),
			ending: now.clone().toDate()
		})
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
	
	colorCount = (color) => {
		return this.weekFilter(this.props.teachers_responses).filter(resp => resp.answer == color).length
	}

	listFeedback = () => {
		return this.weekFilter(this.props.teachers_responses).map(resp => {
			if (!!resp.feedback){
				return <li key={resp.id}>{resp.feedback}</li>
			} else {
				return null
			}
		})
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
		
		allData = this.props.teachers_responses ? (this.props.teachers_responses.filter(response => response.datatype == 'light')) : []
		let myData = this.weekFilter(allData).map(response => (
			{
			label: moment(parseInt(response.day)).format("dddd"),
			date: moment(parseInt(response.day)).format("MMM Do"),
			x: moment(parseInt(response.day)).toDate(),
			y: hash[response.answer],
			student: response.student_id,
			course: response.course_id,
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
				text: "Responses from All Classes",
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
				labelAngle: -15,
				labelFormatter: function (e) {
					return CanvasJS.formatDate( e.value, "MMM D")}
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
				click: function(e){
					student = e.dataPoint.student
					course = e.dataPoint.course
				  },
				toolTipContent: "<b>{label}</b><br>Date: {date}<br>Class: {course}<br>Student: {student}",
				indexLabelWrap: true,
				dataPoints: this.fillData()
			}]
		}
		return (
			<div className="flex-row" style={{'alignItems':'center', 'marginTop': '20px'}}>
                {/* <div className='col-md-1'></div> */}
                <div className='col-md-8'>
				<br></br><br></br><br></br><br></br>
				<CanvasJSChart id='indiv-data' options = {options} style={{'backgroundImage':"linear-gradient(green, yellow, red)", 'opacity': '0.2'}}
				/>
				<br></br>
				<button className="btn btn-outline-primary weekBack" onClick={this.weekBack}><h2>{back}</h2></button>
				<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button>
				<br></br>
				<br></br>
				</div>
                    <div className='col-md-2' >
					<br></br><br></br><br></br>
						<div className='feedback'>
						<h5>Week's Color Counts</h5>
						<br></br>
						<b style={{'color': '#34A853', 'lineHeight': '1.2rem' }}>Greens:</b> <span style={{'fontSize': 'larger'}}>{this.colorCount('green')}</span>
						<br></br>
						<b style={{'color': 'rgb(248, 200, 54)', 'lineHeight': '1.2rem' }}>Yellows: </b><span style={{'fontSize': 'larger'}}>{this.colorCount('yellow')}</span>
						<br></br>
						<b style={{'color': '#EA4335', 'lineHeight': '1.2rem'}}>Reds: </b><span style={{'fontSize': 'larger'}}>{this.colorCount('red')}</span>
						</div>
					<div className='col-md-1' ></div>
					</div>
			</div>
		);
	}
}
	
const mapStateToProps = state => {
	return {
		teachers_responses: state.responses.teachers_responses,
		user_courses: state.courses.user_courses
	}
}


export default connect(mapStateToProps)(AllClasses)