import React from 'react'
import { api } from '../services/api'
import TeacherProfile from '../teachers/TeacherProfile'
import StudentProfile from '../students/StudentProfile'
import { connect } from 'react-redux'

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

export default connect(MapStateToProps)(ClassPage)