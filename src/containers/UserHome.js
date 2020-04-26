import React, { Fragment } from 'react'
// import { api } from '../services/api'
import TeacherProfile from '../teachers/TeacherProfile'
import StudentProfile from '../students/StudentProfile'
// import ClassPage from '../containers/ClassPage'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";
import { setUserCourses } from '../redux'


class UserHome extends React.Component{

//depending on who is logged in, conditionally render either the StudentProfile page or the TeacherProfile page
renderCourses = () => {
  this.props.onSetUserCourses(this.props.current_user)
}

showButtons = () => {
  if (!!this.props.user_courses){
    return this.props.user_courses.map(course => {
      return <button key={course.id} onClick={this.handleSelectCourse}>{course.title}</button>
    })
  }
}




    render(){
        return (
          <Fragment>
            <h2>Welcome {this.props.current_user ? `, ${this.props.current_user.username}!` : "!"}</h2>
            {this.renderCourses()}
            {this.showButtons()}
            <div>{this.props.current_user.admin ? <TeacherProfile/> : <StudentProfile/>}</div>
          </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_user: state.students.current_user,
        user_courses: state.courses.user_courses
    }
}

const mapDispatchToProps = dispatch => {
  return {
     onSetUserCourses: (user) => setUserCourses(user)(dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserHome);