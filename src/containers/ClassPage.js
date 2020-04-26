import React from 'react'
// import { api } from '../services/api'
import TeacherClass from '../teachers/TeacherClass'
import StudentClass from '../students/StudentClass'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";
import {currentCourse} from '../redux'

class ClassPage extends React.Component{
//conditionally render either Teacher View or Student view for a class

//find current_course based on url :id param and update store with it
    componentDidMount(){
        // const id = this.props.match.params.id
        // const set_course = this.props.courses.find(id)
        console.log(this.props)
    }

    // showClass = () => {
    //    return this.props.current_user.admin ? <TeacherClass/> : <StudentClass/>
    // }


    render(){
        return (
            // <div>{this.showClass()}</div>
            <StudentClass/>
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
      setCurrentCourse: (course) => dispatch(currentCourse(course))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ClassPage)