import React, {Fragment} from 'react'
import AssignmentsContainer from '../components/AssignmentsContainer'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { currentCourse } from '../redux'
import AuthHOC from "../HOCs/AuthHOC";

class StudentProfile extends React.Component{

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
                            <li><button className="btn btn-outline-primary" style={{'maxWidth': '350px'}} key={course.id} onClick={this.handleSelectCourse}><Link onClick={course => this.setCourse} key={course.id} to={{pathname: `/courses/${course.id}`,
                            state: {course}
                        }}>{course.title}</Link></button></li>)})
                     : "No courses yet entered"}

                    </div>
                    <div className='col-md-3'></div>
                    <div className ="col-md-4" style={{'borderStyle': 'solid', 'borderWidth': '3px', 'borderColor': 'var(--gray-dark)', 'position': 'relative', 'right': '10%', 'padding': '15px'}}>
                        <AssignmentsContainer/>
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
        setCurrentCourse: course => dispatch(currentCourse(course))
        }
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentProfile)