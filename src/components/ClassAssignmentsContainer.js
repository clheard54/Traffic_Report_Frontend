import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import {fitty} from 'fitty'

class ClassAssignmentsContainer extends React.Component{
    state = {
        showForm: false,
        assignments: []
    }

    renderAssignments = (course) => {
        if (!!course.id){
        if (this.props.current_course.assignments.length == 0) {
            return <div><br></br><p>It's your lucky day! There are currently no assignments.</p></div>
        } else {
        return this.props.current_course.assignments.map(hw => {
            return <li key={hw.id}>{hw.details}</li>})
        }
    }
    }

    // To add a new assignment (teachers only)
    handleSubmit = (event) => {
        event.preventDefault();
        let newHW = {
            details: event.target.details.value,
            course_id: this.props.current_course.id
        }
        api.posts.postAssignment(newHW).then(data => {
            this.setState({
                showForm: false,
                assignments: data
            })
        })

    }

    // List of most recent assignments posted
    render(){
        return (
            <div className='borderBox'>
            <h5 style={{'overflowWrap': 'normal' }}>Assignments & Announcements</h5>
            <div>
                <ul style={{'textAlign': 'left'}}>{this.renderAssignments(this.props.current_course)}</ul>
            </div>
            {this.state.showForm ? <div>{this.showForm()}</div> : null}
            </div>
        )
    }

}

const mapStateToProps = state => {
    return {
      current_user: state.auths.current_user,
      current_course: state.courses.current_course,
      user_courses: state.courses.user_courses
    }
  }
  
  export default connect(mapStateToProps)(ClassAssignmentsContainer);