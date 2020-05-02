import React from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux';
import { currentCourse } from '../redux'
import * as moment from 'moment'

let responses
let date
class TriageChart extends React.Component{

    componentDidMount() {
        date = moment()
        if (!this.props.current_course.id) {
            try {
                const current_course = localStorage.getItem('course_token');
                if ('course_token' == null) {
                  return undefined;
                }
                api.getRequests.getCourses().then(data => {
                    let thisCourse = data.filter(course => course.id == parseInt(current_course));
                    this.props.setCurrentCourse(thisCourse)
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
    
    noAnswer = (course) => {
        if (!!course.id) {
            responses = course.responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
            let ids = responses.map(entry => entry.student_id)
            let missing = course.students.filter(student => !ids.includes(student.id)).map(x => x.name)
            if (missing.length == 0){
                return <i>None recorded</i>
            } else {
            return missing.join(', ')
            }
        }
    }

    red = (course) => {
        let allReds = []
        if (!!course.id){
            responses = course.responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))

            let reds = responses.filter(entry => entry.answer == 'red').map(entry => entry.student_id)
            reds.forEach(id => {
                let toAdd = course.students.find(student => student.id == id)
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

    yellow = (course) => {
        let allyellows = []
        if (!!course.id) {
            responses = course.responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
        
            let yellows = responses.filter(entry => entry.answer == 'yellow').map(entry => entry.student_id)
            yellows.forEach(id => {
                let toAdd = course.students.find(student => student.id == id)
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

    green = (course) => {
        let allgreens = []
        if (!!course.id) {
            responses = course.responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))
        
            let greens = responses.filter(entry => entry.answer == 'green').map(entry => entry.student_id)
            greens.forEach(id => {
                let toAdd = course.students.find(student => student.id == id)
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
              <tbody>
                <tr style={{'backgroundColor': '#007bffc9', 'padding': '6px'}}>
                    <th style={{'padding': '6px'}}>HAVE NOT ANSWERED: </th>
                    <td style={{'padding': '12px 4px'}}>{this.noAnswer(this.props.current_course)}</td>
                </tr>
                <tr>
                    <th style={{'padding': '6px', 'height': '20px'}}>RED LIGHT: </th>
                    <td style={{'padding': '12px 4px'}}>{this.red(this.props.current_course)}</td>
                </tr>
                <tr>
                    <th style={{'padding': '6px'}}>YELLOW:</th>
                     <td style={{'padding': '12px 4px'}}>{this.yellow(this.props.current_course)}</td>
                </tr>
                <tr>
                    <th style={{'padding': '6px'}}>GREEN:</th>
                    <td style={{'padding': '12px 4px'}}>{this.green(this.props.current_course)}</td>
                </tr>
              </tbody>
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

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TriageChart)