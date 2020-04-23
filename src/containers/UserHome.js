import React from 'react'
import { api } from '../services/api'
import TeacherProfile from '../teachers/TeacherProfile'
import StudentProfile from '../students/StudentProfile'
import ClassPage from '../containers/ClassPage'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";


class UserHome extends React.Component{
//depending on who is logged in, conditionally render either the StudentProfile page or the TeacherProfile page

    render(){
        return (
            <div>{this.props.current_user.admin ? <TeacherProfile/> : <StudentProfile/>}</div>
        )
    }
}

const MapStateToProps = state => {
    return {
        current_user: state.current_user
    }
}

export default AuthHOC(connect(MapStateToProps)(ClassPage))