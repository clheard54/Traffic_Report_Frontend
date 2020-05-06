import React from 'react'
import TeacherClass from '../teachers/TeacherClass'
import StudentClass from '../students/StudentClass'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";
import {currentCourse, setCurrentCourse } from '../redux'
// import { api } from '../services/api';

class ClassPage extends React.Component{
//conditionally render either Teacher View or Student view for a class

    componentDidUpdate(prevProps){
        if (prevProps.current_user !== this.props.current_user || prevProps.current_course != this.props.current_course){
            this.showClass()
        } 
    }

    showClass = () => {
       return this.props.current_user !== null ? (this.props.current_user.admin ? <TeacherClass {...this.props}/> : <StudentClass {...this.props}/>) : null
    }


    render(){
        return (
            <div>{this.showClass()}</div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_user: state.auths.current_user,
        current_course: state.courses.current_course,
        courses: state.courses.courses,
        teachers_responses: state.responses.teachers_responses
    }
}

const mapDispatchToProps = dispatch => {
    return {
      setCurrentCourse: (course) => dispatch(currentCourse(course)),
    }
}

export default AuthHOC(connect(mapStateToProps, mapDispatchToProps)(ClassPage))