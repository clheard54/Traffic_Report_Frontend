import React from 'react'
import { connect } from 'react-redux'
import { api } from '../services/api'

class AddAssignmentForm extends React.Component{
    constructor(){
        super()
        this.state = {
            assignment: {
                details: '',
                dueDate: '',
            }
        }
    }
    postAssignment = (event) => {
        event.preventDefault();
        let newHW = {
            assignment: {
                details: `${this.state.assignment.details}. Due ${this.state.assignment.dueDate}`,
                course_id: this.props.current_course.id
            }
        }
        api.posts.postAssignment(newHW)
        .then(() => this.props.hwAdded())
    }

    handleChange = (event) => {
        let newState = {
            assignment: {
                ...this.state.assignment,
                [event.target.name]: event.target.value
            }
        }
        this.setState(newState)
    }
    
    render(){
        return (
            <div>
            <h5>Add a Class Assignment or Announcement</h5>
                <form onSubmit={this.postAssignment}>
                <label>Enter details: &ensp;</label><br></br>
                <textarea rows="2" columns='6' name='details' value={this.state.details} onChange={this.handleChange}></textarea><br></br>
                <br></br>
                <label>Due Date:</label>
                <input type="date" name='dueDate' value={this.state.dueDate} onChange={this.handleChange}></input>
                <br></br><br></br>
                <input className="btn btn-success" type='submit' value="Post Assignment"></input>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_course: state.courses.current_course
    }
}

export default connect(mapStateToProps)(AddAssignmentForm)