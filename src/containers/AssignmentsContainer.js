import React, {Fragment} from 'react'
import { api } from '../services/api'

export default class Assignments extends React.Component{
    state = {
        showForm: false,
        assignments: []
    }

    componentDidMount(){
        api.getRequests.getAssignments()
            .then(data => {
                this.setState({
                    assignments: data
                })
         })
    }

    renderAssignments = () => {
        return this.state.assignments.map(hw => {
           return <li>{hw.details}</li>
        })
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
                <label>Add Question:</label>
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
            {this.props.current_user.admin ? <button onClick={() => this.setState({showForm: true})}>Add Question</button> : null}
            {this.state.showForm ? <div>{this.showForm()}</div> : null}}
            <h3>Assignments/Announcements</h3>
            <div>
                <ul>{this.renderAssignments()}</ul>
            </div>

            </Fragment>
        )
    }

}

const mapStateToProps = state => {
    return {
      current_user: state.current_user,
      current_course: state.current_course
    }
  }
  
  export default connect(mapStateToProps)(Assignments);