import React, { Fragment } from 'react'
// import { api } from '../services/api'
import TeacherProfile from '../teachers/TeacherProfile'
import StudentProfile from '../students/StudentProfile'
// import ClassPage from '../containers/ClassPage'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";


class UserHome extends React.Component{

//depending on who is logged in, conditionally render either the StudentProfile page or the TeacherProfile page

    render(){
        return (
          <Fragment>
            <h2>Welcome {this.props.current_user ? `, ${this.props.current_user.username}!` : "!"}</h2>
            <div>{this.props.current_user.admin ? <TeacherProfile/> : <StudentProfile/>}</div>
          </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_user: state.students.current_user
    }
}

export default AuthHOC(connect(mapStateToProps)(UserHome))