import React from 'react'
import { api } from '../services/api'
import TeacherClass from '../teachers/TeacherClass'
import StudentClass from '../students/StudentClass'
import { connect } from 'react-redux'

class ClassPage extends React.Component{
//conditionally render either Teacher View or Student view for a class

    render(){
        return (
            <div>{this.props.current_user.admin ? <TeacherClass/> : <StudentClass/>}</div>
        )
    }
}

const MapStateToProps = state => {
    return {
        current_user: state.current_user
    }
}

export default connect(MapStateToProps)(ClassPage)