import React from 'react'
import { connect } from 'react-redux'

class AddCPQuestion extends React.Component{

    addQuestion = (event) => {
        event.preventDefault();
        console.log(event.target.course.value)
        console.log(event.target.question.value)
        //postQuestion via api method
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
                        return <option value={course.id}>{course.title}</option>
                    })}
                </select>
                <br></br>
                <div style={{'display': 'flex', 'flexDirection': 'row', 'alignItems': 'flex-start'}}>
                <label style={{'lineHeight': '60px'}}>Enter question: &ensp;</label>
                <textarea rows="2" name='question'></textarea>
                </div>
                <br></br>
                <input type='submit' value="Post Question"></input>
                </form>
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