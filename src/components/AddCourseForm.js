import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'

class AddCourseForm extends React.Component{
    constructor() {
        super();
        this.state = {
            courses: [],
            submitted: false
        }
    }

    componentDidMount = () => {
        api.getRequests.getCourses()
        .then(data => {
            this.setState({
                courses: data
            })
        })
    }
    
    listCourses = (arr) => {
        return arr.map(course => {
            return (
              <Fragment>
                <input type="checkbox" id={course.id} name='courses' value={course.id}></input>
                <label htmlFor={course.id}> {course.title}</label>
                <br></br>
              </Fragment>
            )
        })
    }

  handleSubmit = (event) => {
    event.preventDefault()
    event.target.courses.forEach(x => {
        if (x.checked){
            let toAdd = {
                enrollment: {
                    student_id: this.props.current_user.id,
                    course_id: x.value
                }
            }
            api.posts.addStudentClass(toAdd).then(data => console.log(data))
            }
    })
    this.setState({
        submitted: true
    })
  }


  render() {
      return (
        <div className='container' id='signup'>
            <div className='container border-top-0 border-bottom-0' id="signup-inset">
            {!this.state.submitted ? 
                <Fragment>
                    <h3>All Course Offerings:</h3>
                    Select the courses you'd like to add to your account.
                    <br></br>
                    <br></br>
                    <form onSubmit={this.handleSubmit}>
                    {this.listCourses(this.state.courses)}
                    <br></br>
                    <input className='btn btn-success' type="submit" value="Add Classes"></input>
                    </form>
                </Fragment>
              : <Fragment>
                    <h3>Success!</h3>
                    <br></br>
                    <br></br>
                    <button className='btn btn-outline-success btn-lg font-weight-bolder' onClick={() => this.props.history.push('/profile')} >Return to Profile</button>
                </Fragment> }
            </div>
          </div>
      )
  }
}

const mapStateToProps = state => {
    return {
        current_user: state.auths.current_user
    }
}

export default connect(mapStateToProps)(AddCourseForm)