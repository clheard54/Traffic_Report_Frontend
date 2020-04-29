import React, { Fragment } from 'react'
import { api } from '../services/api'
// import TodaysData from '../data_charts/TodaysData'
import AuthHOC from "../HOCs/AuthHOC";
import AllClasses from '../data_charts/AllClasses'
// import WeekAvgs from '../data_charts/WeekAvgs'
// import WeekTotal from '../data_charts/WeekTotal'
import { Link } from 'react-router-dom'
import AddCPQuestion from './AddCPQForm'
import { currentCourse, loadTeachersResponses } from '../redux'
import { connect } from 'react-redux'

let allData = []
class TeacherProfile extends React.Component{

    componentDidUpdate(prevProps){
        if (prevProps.current_user !== this.props.current_user || prevProps.user_courses !== this.props.user_courses){
            if (this.props.current_user && this.props.user_courses){
            let courseIds = this.props.user_courses.map(course => course.id)
            this.props.loadTeachersResponses(courseIds)
        }
      }
    }

    setCourse = (course) => {
        this.props.setCurrentCourse(course)
    }
    

    render(){
        return (
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%'}}>
                <div className="row" style={{'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-md-2'></div>
                    <div className='col-md-3' style={{'display': 'flex', 'flexDirection': 'column', 'textAlign':'center'}}>
                        <h4 style={{'color': '#007bff', 'lineHeight': '200%'}}>Your Classes</h4>
                        {this.props.user_courses ? this.props.user_courses.map(course => {
                        return (
                            <div><li><button className="btn btn-outline-primary" style={{'maxWidth': '350px'}} key={course.id} onClick={this.handleSelectCourse}><Link onClick={course => this.setCourse(course)} key={course.id} to={{pathname: `/courses/${course.id}`,
                            state: {course}
                        }}>{course.title}</Link></button></li><br></br></div>)})
                        : "No courses yet entered"}

                    </div>
                    <div className='col-md-3'></div>
                    <div className ="col-md-4" style={{'borderStyle': 'solid', 'borderWidth': '3px', 'borderColor': 'var(--gray-dark)', 'position': 'relative', 'right': '10%', 'padding': '15px'}}>
                        <AddCPQuestion/>
                    </div>
                </div>
                </div>
                <br></br>
                <br></br>

                <hr></hr>
                <div className="row" style={{'display': 'flex','flexDirection': 'column', 'justifyContent': 'center', 'marginTop': '90px'}}>
                <div><br></br></div>
                <div><br></br></div>
                <div className="row">
                    <div className='col-md-2'></div>
                    <div className='col-md-8'>
                    <AllClasses />
                    </div>
                    <div className='col-md-2'></div>

                </div>
                </div>
                <div><br></br></div>

                <br></br>
                <br></br>
                <br></br>
                <br></br>
                <div>
                    <img style={{'backgroundColor': 'white', 'opacity': '0.8', 'maxWidth': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
                </div>
                
            </Fragment>
            )
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
        setCurrentCourse: course => dispatch(currentCourse(course)),
        loadTeachersResponses: courseIds => loadTeachersResponses(courseIds)(dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TeacherProfile)


