import React from 'react'
// import { api } from '../services/api'
import TeacherProfile from '../teachers/TeacherProfile'
import StudentProfile from '../students/StudentProfile'
// import ClassPage from '../containers/ClassPage'
import { connect } from 'react-redux'
import AuthHOC from "../HOCs/AuthHOC";


class UserHome extends React.Component{
    state = {
        current_user: this.props.current_user
    }
//depending on who is logged in, conditionally render either the StudentProfile page or the TeacherProfile page
    componentDidMount(){
        console.log(this.props)
    }

    render(){
        return (
          <div>
            <h2>Welcome, {this.state.current_user.name}</h2>
            <div>{this.state.current_user.admin ? <TeacherProfile/> : <StudentProfile/>}</div>
          </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_user: state.students.current_user
    }
}

export default AuthHOC(connect(mapStateToProps)(UserHome))