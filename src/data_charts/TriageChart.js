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

    findColors = (course, color) => {
        let allOfColor = []
        if (!!course.id){
          responses = course.responses.filter(resp => moment(parseInt(resp.day)).format("MMM D") == moment(date).format("MMM D"))

          let thisColor = responses.filter(entry => entry.answer == color).map(entry => entry.student_id)
            thisColor.forEach(id => {
                let toAdd = course.students.find(student => student.id == id)
                if (!allOfColor.includes(toAdd.name)){
                    allOfColor.push(toAdd.name)
                }
            })
        }
        if (allOfColor.length == 0){
            return <i>None recorded</i>
        } else {
            return allOfColor.join(', ')
        }
    }


    render(){
        return (
          <div>
          <h5>Today's Triage Chart:</h5>
          {this.props.class_responses !== undefined ?
            <table style={{width:"100%"}}>
              <tbody>
                <tr style={{'backgroundColor': '#007bffc9', 'padding': '6px'}}>
                    <th>HAVE NOT ANSWERED: </th>
                    <td>{this.noAnswer(this.props.current_course)}</td>
                </tr>
                <tr>
                    <th>RED LIGHT: </th>
                    <td>{this.findColors(this.props.current_course, 'red')}</td>
                </tr>
                <tr>
                    <th>YELLOW:</th>
                     <td>{this.findColors(this.props.current_course, 'yellow')}</td>
                </tr>
                <tr>
                    <th>GREEN:</th>
                    <td>{this.findColors(this.props.current_course, 'green')}</td>
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