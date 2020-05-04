import React from 'react'
import { connect } from 'react-redux'
import TimerMixin from 'react-timer-mixin';
import { api } from '../services/api'

class AddCPQuestion extends React.Component{
    state = {
        posted: false
    }


    addQuestion = (event) => {
        event.preventDefault();
        let newCPQ = {
            question: event.target.question.value,
            course_id: event.target.course.value
        }
        api.posts.postCpq(newCPQ).then(data => {
            if (!!data.error) {
                console.log(data.error)
            } else {
            this.setState({ posted: true })
            TimerMixin.setTimeout(
                () => this.setState({ posted: false }),
                3000)
            }
        })
        event.target.course.value = "all"
        event.target.question.value = ''
    }
    

    render(){
        return (
            <div>
            <h5>Post a Class Participation Question?</h5>
                <br></br>
                <form onSubmit={this.addQuestion}>
                <label>What class?&ensp;</label>
                <select id="courses" name="course">
                    <option value="all">All Courses</option>
                    {this.props.user_courses.map(course => {
                        return <option key={course.id} value={course.id}>{course.title}</option>
                    })}
                </select>
                <br></br>
                <div style={{'display': 'flex', 'flexDirection': 'row', 'justifyContent': 'center'}}>
                <label style={{'lineHeight': '60px'}}>Enter question: &ensp;</label>
                <textarea rows="3" name='question'></textarea>
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