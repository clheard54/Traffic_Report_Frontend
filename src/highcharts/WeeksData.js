import React, { useState } from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import * as moment from 'moment';
import DatePicker from "react-datepicker"
import { connect } from 'react-redux'
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

function TimeframeData(props){
    const now = moment()
    const beginning = now.clone().subtract(1, 'week').format()
    const ending = now.clone().format()

    const [start_date, setStartDate] = useState(beginning);
    const [end_date, setEndDate] = useState(ending)
    
			
    const fillData = () => {
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
        let myData = props.current_course.id ? (props.current_course.responses.filter(response => response.datatype == 'light').filter(response => (moment(parseInt(response.day)) >= moment(start_date)) && (moment(parseInt(response.day)) <= moment(end_date))).map(response =>
			({
				label: moment(parseInt(response.day)).format("MMM D"),
				x: moment(parseInt(response.day)).toDate(),
                y: hash[response.answer],
				// z: 80*(Math.sqrt(2))**2,
                markerColor: matchColor[response.answer],
                fillOpacity: 0.7,
                markerSize: 35,
				course: response.course_id,
				student: response.student_id
            })
		)) : []
		return myData;
	}
			
              
      const options = {
        animationEnabled: true,
        exportEnabled: true,
        title:{
            text: "Past Week's Traffic",
        fontSize: 26
        },
        axisX: {
            title: 'Date Range',
            gridThickness: 2
            // logarithmic: false
        },
        axisY: {
            title: "Traffic Temperature",
            labelWrap: true,
			labelAngle: -25
        },
        
        data: [
        {        
            type: "bubble",
            xValueType: "dateTime",
            toolTipContent: "<b>{label}</b><br>Date: {x}<br>Class: {course}<br>Student: {student}",
            indexLabelWrap: true,
            dataPoints: [
            fillData()
            ]
        }
        ]
    }
          
     return (
        <div>
          <CanvasJSChart options = {options}
              /* onRef = {ref => this.chart = ref} */
          />
        </div>
        //   <DatePicker placeholderText="Select start date"
        //     selected={start_date}
        //     onChange={date => setStartDate(date)} 
        //     maxDate={new Date()}
        //   />
        //   <DatePicker placeholderText="Select end date"
        //     selected={end_date}
        //     onChange={date => setEndDate(date)}
        //     minDate={start_date}
        //     maxDate={new Date()}
        //   />
        
      );
}

const mapStateToProps = state => {
    return {
        current_user: state.auths.current_user,
        current_course: state.courses.current_course,
    }
}

export default connect(mapStateToProps)(TimeframeData)