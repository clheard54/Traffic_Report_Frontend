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
                <div className="row" style={{'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-md-2'></div>
                    <div className='col-md-3' style={{'display': 'flex', 'flexDirection': 'column', 'textAlign':'center'}}>
                        <h4 style={{'color': '#007bff', 'lineHeight': '200%'}}>Your Classes</h4>
                        {this.props.user_courses ? this.props.user_courses.map(course => {
                        return (
                            <div><br></br><li key={course.id}><button className="btn btn-outline-primary" style={{'maxWidth': '350px'}} onClick={() => this.setCourse(course)}><Link onClick={() => this.setCourse(course)} key={course.id} to={{pathname: "/courses/current",
                            state: {course}
                        }}>{course.title}</Link></button></li></div>)})
                     : "No courses yet entered"}

                    </div>
                    <div className='col-md-3'></div>
                    <div className ="col-md-4" style={{'borderStyle': 'solid', 'borderWidth': '3px', 'borderColor': 'var(--gray-dark)', 'position': 'relative', 'right': '10%', 'padding': '15px'}}>
                        <UserAssignments/>
                    </div>
                </div>
                </div>
                <div style={{'display': 'flex', 'position': 'absolute', 'bottom': '25px'}}>
                    <img style={{'backgroundColor': 'white', 'opacity': '0.8', 'maxWidth': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img><img style={{'backgroundColor': 'white', 'opacity': '0.8', 'maxWidth': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
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