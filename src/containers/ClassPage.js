import React from 'react'
// import { api } from '../services/api'
import TeacherClass from '../teachers/TeacherClass'
import StudentClass from '../students/StudentClass'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";
import {currentCourse, setCurrentCourse} from '../redux'

class ClassPage extends React.Component{
//conditionally render either Teacher View or Student view for a class

//find current_course based on url :id param and update store with it
    componentDidMount(){
        console.log(this.props)
        this.props.setCurrentCourse(this.props.history.location.state.course)
    }

    // showClass = () => {
    //    return this.props.current_user.admin ? <TeacherClass/> : <StudentClass/>
    // }


    render(){
        return (
            // <div>{this.showClass()}</div>
            <StudentClass current_course={this.props.history.location.state.course}/>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_user: state.students.current_user,
        current_course: state.courses.current_course,
        courses: state.courses.courses
    }
}

const mapDispatchToProps = dispatch => {
    return {
      setCourse: (course) => dispatch(currentCourse(course)),
      setCurrentCourse: course => setCurrentCourse(course)(dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassPage)