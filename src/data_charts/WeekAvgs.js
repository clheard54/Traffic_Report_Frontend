import React, {Component} from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import { connect } from 'react-redux'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

// Only difference from TodaysData may be that we are now pulling 5 days' worth of responses, and building 5 columns.
let dataset = []
class WeekAvgs extends Component {	
   
	sortData = (responses) => {
		let date = new Date()
		let today = date.toDateString().slice(4,10)
		date.setDate(date.getDate()-7)
		let weekago = date.toDateString().slice(4,10)
		const ordered = responses.sort((a,b) => (a.day < b.day) ? 1 : -1)
		if (ordered.length !== 0){
			const todayDateAsInt = parseInt(ordered[0].day)
			let week = []
			for (let i=0; i<7; i++){
				week[i] = responses.filter( resp => Math.abs(parseInt(resp.day) - (todayDateAsInt-7+i))<1 )
			}
			console.log(week)
				return dataset = week.map(dayData => {
					return ({
					label: `${weekago.slice(0,4)} ${parseInt(weekago.slice(4))+week.indexOf(dayData)}`,
					x: week.indexOf(dayData)+1,
					y: (1/dayData.length)*(dayData.reduce((a,b) => a+b)), 
					z: 80*2, 
					color: 'gray' })
				})
			}
		}
	
	render() {
        const n = Math.sqrt(2)
        const today = new Date().toDateString().slice(4)
        const options = {
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", // "light1", "light2", "dark1", "dark2"
			title:{
				text: "Average Each Day",
			fontSize: 26
			},
			axisX: {
				title: `Today - ${today}`,
			logarithmic: false
			},
			axisY: {
				title: "Traffic Temperature"
			},
			data: [{
				type: "bubble",
				indexLabel: "{label}",
				toolTipContent: "<b>{label}</b><br>Date: {x}<br>Traffic Temperature: {y}<br>Diameter: {z} number",
				dataPoints: this.sortData(this.props.current_course.responses)
			}]
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
        user_courses: state.courses.user_courses
    }
}

export default connect(mapStateToProps)(WeekAvgs)