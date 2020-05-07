import React, { Fragment } from 'react'
import { api } from '../services/api'
import AuthHOC from "../HOCs/AuthHOC";
import AllClasses from '../data_charts/AllClasses'
// import WeekAvgs from '../data_charts/WeekAvgs'
// import WeekTotal from '../data_charts/WeekTotal'
import { Link } from 'react-router-dom'
import AddCPQuestion from './AddCPQForm'
import { currentCourse, loadTeachersResponses } from '../redux'
import { connect } from 'react-redux'

class TeacherProfile extends React.Component{

    componentDidMount(){
        let courseIds = this.props.user_courses.map(course => course.id)
        this.props.loadTeachersResponses(courseIds)
    }

    componentDidUpdate(prevProps){
        if (prevProps.current_user !== this.props.current_user || prevProps.user_courses !== this.props.user_courses){
            if (this.props.current_user && this.props.user_courses){
            let courseIds = this.props.user_courses.map(course => course.id)
            this.props.loadTeachersResponses(courseIds)
        }
      }
    }

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
                            <div key={course.id}><li><button className="btn btn-outline-primary" style={{'maxWidth': '350px'}} onClick={() => this.setCourse(course)}><Link onClick={() => this.setCourse(course)} key={course.id} to={{pathname: "/courses/current",
                            state: {course}
                        }}>{course.title}</Link></button></li><br></br></div>)})
                        : "No courses yet entered"}

                    </div>
                    <div className='col-md-2'></div>
                    <div className ="col-md-5 cpq">
                        <AddCPQuestion/>
                    </div>
                </div>
                </div>
                <br></br>
                <br></br>

                

                <hr style={{'borderColor': '#dc3545'}}></hr>
                <div className="flex-row">
                <Fragment>
                    <AllClasses />
                </Fragment>
                </div>
                <div><br></br></div>

                <br></br>
                <br></br>
                <div>
                <br></br>
                <br></br>
                <br></br>
                <div style={{'display': 'flex'}}>
                    <img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img><img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
                </div>
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

export default AuthHOC(connect(mapStateToProps, mapDispatchToProps)(TeacherProfile))


