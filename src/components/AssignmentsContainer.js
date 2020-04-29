import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import {fitty} from 'fitty'

class AssignmentsContainer extends React.Component{
    state = {
        showForm: false,
        assignments: []
    }

    componentDidMount(){
        let classHW = []
        api.getRequests.getAssignments()
            .then(data => {
                if (!this.props.current_course.id){
                    classHW = data
                } else {
                    if (data.length > 0){
                    classHW = data.filter(hw => hw.course_id == this.props.current_course.id)
                }
            }
            this.setState({
                assignments: classHW
            })
         })
    }

    renderAssignments = () => {
        if (this.state.assignments.length > 0){
            return this.state.assignments.map(hw => {
            return <li key={hw.id}>{hw.details}</li>
            })
        }
    }

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
            <h5 style={{'fontSize': '110%'}}>Assignments/Announcements</h5>
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
      current_course: state.courses.current_course
    }
  }
  
  export default connect(mapStateToProps)(AssignmentsContainer);