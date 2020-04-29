import React from 'react'
// import { api } from '../services/api'
import TeacherClass from '../teachers/TeacherClass'
import StudentClass from '../students/StudentClass'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";
import {currentCourse, setCurrentCourse} from '../redux'

class ClassPage extends React.Component{
//conditionally render either Teacher View or Student view for a class
componentDidMount(){
    console.log(this.props)
    this.props.setCurrentCourse(this.props.history.location.state.course)
}
//find current_course based on url :id param and update store with it
    componentDidUpdate(prevProps){
        if (prevProps.current_user !== this.props.current_user){
            this.showClass()
        }
    }

    showClass = () => {
       return this.props.current_user ? (this.props.current_user.admin ? <TeacherClass/> : <StudentClass/>) : null
    }


    render(){
        return (
            <div>{this.showClass()}</div>
            /* <StudentClass current_course={this.props.history.location.state.course}/> */
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

export default connect(mapStateToProps, mapDispatchToProps)(ClassPage)