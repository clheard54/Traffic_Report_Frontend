import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import {fitty} from 'fitty'

class UserAssignments extends React.Component{
    state = {
        showForm: false,
        assignments: []
    }

    renderAssignments = () => {
        return this.props.user_courses.map(course => {
            return (
            <div>
                <ul><b>{course.title}:</b></ul>
                {course.assignments.map(hw => {
                return <li key={hw.id}>{hw.details}</li>})}
            </div>
            )
        })
    }

//Teacher can add new assignments
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

     // Form for teacher to post assignments, rendered conditionally
    showForm = () => {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Add Post:</label>
                <input type="textarea" name="details"></input>
                <br></br>
                <input type="button" onClick={() => this.setState({showForm: false})}>Go Back</input>&emsp;&emsp;
                <input type="submit" value="Post Question"></input>
            </form>
        )
     }

    // List of most recent assignments posted
    render(){
        return (
            <Fragment>
            <h5 style={{'fontSize': '130%'}}>Assignments/Announcements</h5>
            <div>
                <ul style={{'textAlign': 'left'}}>{this.renderAssignments()}</ul>
            </div>
            {this.props.current_user ? (this.props.current_user.admin ? <button onClick={() => this.setState({showForm: true})}>Add Question</button> : null) : null}
            {this.state.showForm ? <div>{this.showForm()}</div> : null}
            </Fragment>
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
  
  export default connect(mapStateToProps)(UserAssignments);