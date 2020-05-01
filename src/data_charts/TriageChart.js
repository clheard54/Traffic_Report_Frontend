import React from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux';
import * as moment from 'moment'

let responses
let date
class TriageChart extends React.Component{

    componentDidMount(){
        date = moment()
        //     
    }

    // componentDidUpdate(prevProps){
    //     if (prevProps.class_responses !== this.props.class_responses || prevProps.current_course !== this.props.current_course){
    //         this.setState({
    //             ids: this.props.class_responses.map(resp => resp.student_id[0]),
    //             students: this.props.current_course.students
    //         })
    //     }
    // }

    noAnswer = (course) => {
        if (this.props.class_responses != undefined) {
            responses = this.props.class_responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
            let ids = responses.map(entry => entry.student_id)
            let missing = course.students.filter(student => !ids.includes(student.id)).map(x => x.name)
            if (missing.length == 0){
                return <i>None recorded</i>
            } else {
            return missing.join(', ')
            }
        }
    }

    red = (classR) => {
        let allReds = []
        if (this.props.class_responses != undefined) {
            responses = classR.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))

            let reds = responses.filter(entry => entry.answer == 'red').map(entry => entry.student_id)
            reds.forEach(id => {
                let toAdd = this.props.current_course.students.find(student => student.id == id)
                if (!allReds.includes(toAdd.name)){
                    allReds.push(toAdd.name)
                }
            })
        }
        if (allReds.length == 0){
            return <i>None recorded</i>
        } else {
            return allReds.join(', ')
        }
    }

    yellow = (classR) => {
        let allyellows = []
        if (this.props.class_responses != undefined) {
            responses = classR.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
        
            let yellows = responses.filter(entry => entry.answer == 'yellow').map(entry => entry.student_id)
            yellows.forEach(id => {
                let toAdd = this.props.current_course.students.find(student => student.id == id)
                if (toAdd){
                if (!allyellows.includes(toAdd.name)){
                    allyellows.push(toAdd.name)
                }
            }
            })
        }
        if (allyellows.length == 0){
            return <i>None recorded</i>
        } else {
        return allyellows.join(', ')
        }
    }

    green = (classR) => {
        let allgreens = []
        if (this.props.class_responses != undefined) {
            responses = classR.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
        
            let greens = responses.filter(entry => entry.answer == 'green').map(entry => entry.student_id)
            greens.forEach(id => {
                let toAdd = this.props.current_course.students.find(student => student.id == id)
                if (!allgreens.includes(toAdd.name)){
                    allgreens.push(toAdd.name)
                }
            })
        }
        if (allgreens.length == 0){
            return <i>None recorded</i>
        } else {
        return allgreens.join(', ')
        }
    }


    render(){
        return (
          <div>
          <h5>Triage Chart:</h5>
          {this.props.class_responses !== undefined ?
            <table style={{width:"100%"}}>
                <tr style={{'backgroundColor': 'rgb(255, 248, 40)', 'padding': '6px'}}>
                    <th style={{'padding': '6px'}}>HAVE NOT ANSWERED: </th>
                    <td style={{'padding': '12px 4px'}}>{this.noAnswer(this.props.current_course)}</td>
                </tr>
                <tr>
                    <th style={{'padding': '6px', 'height': '20px'}}>RED LIGHT: </th>
                    <td style={{'padding': '12px 4px'}}>{this.red(this.props.class_responses)}</td>
                </tr>
                <tr>
                    <th style={{'padding': '6px'}}>YELLOW:</th>
                     <td style={{'padding': '12px 4px'}}>{this.yellow(this.props.class_responses)}</td>
                </tr>
                <tr>
                    <th style={{'padding': '6px'}}>GREEN:</th>
                    <td style={{'padding': '12px 4px'}}>{this.green(this.props.class_responses)}</td>
                </tr>
            </table> : null }
          </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_course: state.courses.current_course,
        class_responses: state.responses.class_responses
    }
}

export default connect(mapStateToProps)(TriageChart)