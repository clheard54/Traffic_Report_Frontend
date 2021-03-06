import React, { Fragment } from 'react'
// import { api } from '../services/api'
import TeacherProfile from '../teachers/TeacherProfile'
import StudentProfile from '../students/StudentProfile'
// import ClassPage from '../containers/ClassPage'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";

class UserHome extends React.Component{

//Depending on who is logged in, conditionally render either the StudentProfile page or the TeacherProfile page

    render(){
        return (
          <Fragment>
            <h2>Welcome {this.props.current_user ? `, ${this.props.current_user.username}!` : "!"}</h2>
            <hr style={{'maxWidth': '30%', 'color': 'red'}}></hr>
            <div>{this.props.current_user !== null ? (this.props.current_user.admin ? <TeacherProfile/> : <StudentProfile/>) : null}</div>
          </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_user: state.auths.current_user,
        user_courses: state.courses.user_courses
    }
}

export default AuthHOC(connect(mapStateToProps)(UserHome));