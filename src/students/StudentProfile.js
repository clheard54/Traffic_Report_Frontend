import React, {Fragment} from 'react'
import UserAssignments from '../components/UserAssignments'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { currentCourse, loadClassResponses, loadClassAssignments, loadClassQuestions } from '../redux'
import AuthHOC from "../HOCs/AuthHOC";

class StudentProfile extends React.Component{

    setCourse = (course) => {
        localStorage.setItem('course_token', course.id)
        this.props.setCurrentCourse(course)
    }
    
    render(){
        return (
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%'}}>
                <div className="row" style={{'width': '90%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-md-3'></div>
                    <div className='col-md-3' style={{'display': 'flex', 'flexDirection': 'column', 'textAlign':'center'}}>
                        <h4 style={{'color': '#007bff', 'lineHeight': '200%'}}>Your Classes</h4>
                        {this.props.user_courses.length !== 0 ? this.props.user_courses.map(course => {
                        return (
                            <div><br></br><li key={course.id}><button className="btn btn-outline-primary" style={{'maxWidth': '350px'}} onClick={() => this.setCourse(course)}><Link onClick={() => this.setCourse(course)} key={course.id} to={{pathname: "/courses/current",
                            state: {course}
                        }}>{course.title}</Link></button></li></div>)})
                     : 
                     <Fragment>
                      No courses yet entered
                      <br></br><br></br><br></br>
                      <a className="btn btn-outline-warning" style={{'maxWidth': '135px', 'alignSelf': 'center'}} href="/add_course" role="button">Add Classes</a>
                     </Fragment>}

                    </div>
                    <div className='col-md-2'></div>
                    <div className ="col-md-4 user-hw">
                        <UserAssignments/>
                    </div>
                </div>
                </div>
                <div style={{'display': 'flex', 'position': 'absolute', 'bottom': '25px'}}>
                    <img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img><img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
                </div>
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_course: state.courses.current_course,
        user_courses: state.courses.user_courses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => {
            dispatch(currentCourse(course));
        }
    }
}

export default AuthHOC(connect(mapStateToProps, mapDispatchToProps)(StudentProfile))