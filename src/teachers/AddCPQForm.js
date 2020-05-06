import React from 'react'
import { connect } from 'react-redux'
import TimerMixin from 'react-timer-mixin';
import { api } from '../services/api'

class AddCPQuestion extends React.Component{
    state = {
        newCPQ: {
            question: '',
            course_id: null,
            day: null
        },
        posted: false
    }

    handleChange = (event) => {
        let newState = {
            ...this.state,
            newCPQ: Object.assign({}, this.state.newCPQ,
              {[event.target.name]: event.target.value})
        }
          this.setState(newState)
    }

    addQuestion = (event) => {
        event.preventDefault();
        api.posts.postCpq(this.state.newCPQ).then(data => {
            if (!!data.error) {
                console.log(data.error)
            } else {
            this.setState({ posted: true })
            TimerMixin.setTimeout(
                () => this.setState({
                    question: '',
                    course_id: 'all',
                    day: null,
                    posted: false,  }),
                2000)
            }
        })
    }
    

    render(){
        return (
            <div>
            <h5>Post a Class Participation Question?</h5>
                <br></br>
                <form onSubmit={this.addQuestion}>
                <label>What class?&ensp;</label>
                <select onChange={this.handleChange} id="courses" name="course_id">
                    <option value="all">All Courses</option>
                    {this.props.user_courses.map(course => {
                        return <option key={course.id} value={course.id}>{course.title}</option>
                    })}
                </select>
                <br></br>
                <label>Day to be posted?&nbsp;&nbsp;</label>
                <input type='date' name='day' onChange={this.handleChange} value={this.state.day}></input>
                <br></br><br></br>
                <div style={{'display': 'flex', 'flexDirection': 'row', 'justifyContent': 'center'}}>
                <label style={{'lineHeight': '60px'}}>Enter question: &ensp;</label>
                <textarea rows="3" name='question' onChange={this.handleChange} value={this.state.question}></textarea>
                </div>
                <br></br>
                <input className='btn btn-outline-success' type='submit' value="Post Question"></input>
                </form>
                <br></br>
                {this.state.posted ? 
                <p style={{'color': 'red'}}><b>Post Successful!</b></p> : null}
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        user_courses: state.courses.user_courses
    }
}

export default connect(mapStateToProps)(AddCPQuestion)