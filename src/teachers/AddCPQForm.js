import React from 'react'
import { connect } from 'react-redux'

class AddCPQuestion extends React.Component{

    render(){
        return (
            <div>
            <h4>Post a Class Participation Question</h4>
                <form onSubmit={this.addQuestion}>
                <label>What class?</label>
                <select id="courses" name="courseList">
                    <option value="all">All Courses</option>
                    {this.props.user_courses.map(course => {
                        return <option value={course.id}>{course.title}</option>
                    })}
                </select>
                <br></br>
                <label>Enter question:</label>
                <input type='textarea' rows="5" name='question'></input>
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