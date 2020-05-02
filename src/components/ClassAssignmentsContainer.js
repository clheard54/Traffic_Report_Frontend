import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import {fitty} from 'fitty'

class ClassAssignmentsContainer extends React.Component{
    state = {
        showForm: false,
        assignments: []
    }

    // componentDidMount(){
    //     let classHW = []
    //     api.getRequests.getAssignments()
    //         .then(data => {
    //             if (!this.props.current_course.id){
    //                if (this.props.user_courses){
    //                 let ids =this.props.user_courses.map(course => course.id)
    //                 classHW = data.filter(hw => ids.includes(hw.course_id))
    //                } else {
    //                 classHW = data
    //                }
    //             } else {
    //                 if (data.length > 0){
    //                 classHW = data.filter(hw => hw.course_id == this.props.current_course.id)
    //             }
    //         }
    //         this.setState({
    //             assignments: classHW
    //         })
    //      })
    // }

    // renderAssignments = () => {
    //     if (this.state.assignments.length > 0){
    //         return this.state.assignments.map(hw => {
    //         return <li key={hw.id}>{hw.details}</li>
    //         })
    //     }
    // }

    // // componentDidUpdate(){
    // //     console.log(this.props.current_course)
    // // }

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
            <div style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'minHeight': '200px', 'alignText': 'center', 'height': 'fit-content'}}>
            <h5 style={{'overflowWrap': 'normal' }}>Assignments & Announcements</h5>
            <div>
                <ul style={{'textAlign': 'left'}}>{this.renderAssignments(this.props.current_course)}</ul>
            </div>
            {/* {this.props.current_user ? (this.props.current_user.admin ? <button onClick={() => this.setState({showForm: true})}>Add Question</button> : null) : null} */}
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