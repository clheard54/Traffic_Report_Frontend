import React, {Fragment } from 'react'
import '../assets/traffic_form.css'
import { connect } from 'react-redux'
import { postResponse } from '../redux'
import { api } from '../services/api'

class TrafficForm extends React.Component{
	constructor(){
		super();
		this.state = {
			form: true,
			feedback: '',
			error: null
		}
	}

	componentDidUpdate(prevProps){
        if (prevProps.current_course !== this.props.current_course){
			this.setState({
				form: true
			})
		}
	}

	handleChange = (event) => {
		this.setState({
			feedback: event.target.value
		})
	}

	handleSubmit = (event) => {
		event.preventDefault();
		let myAnswer = event.target.color.value
		let newResponse = {
			response: {
				answer: myAnswer,
				datatype: 'color',
				day: '',
				feedback: this.state.feedback,
				courses_student_id: this.props.course_student.id,
				student_id: this.props.current_user.id,
				course_id: this.props.current_course.id
			}
		}
		api.posts.postResponse(newResponse)
		.then(data => {
			if (data.error){
			this.setState({
				form: false,
				error: data.error,
				feedback: ''})
		} else {
			this.setState({
				form: false,
				feedback: '',
				error: null,
				feedback: ''
			})
		  }
		})
	}

	render(){
		return (
			<div className='light-container' style={{'border': '2px solid black', 'margin': 'auto'}}>
			{this.state.form ? <Fragment>
			<br></br>
				<h4>Traffic Check:</h4>
				How do you feel about the material covered in class today?<br></br>
					<span style={{'color': '#EA4335', 'fontWeight': 'bold' }}>Red:</span> STOP, I am so confused.<br></br>
					<span style={{'color': 'rgb(248, 200, 54)', 'fontWeight': 'bold' }}>Yellow:</span> Meh, I kind of know what's going on, but I'm not sure I really understand this.<br></br>
					<span style={{'color': '#34A853', 'fontWeight': 'bold' }}>Green:</span> Great! Feeling good and ready to move on.<br></br>
				<form onSubmit={this.handleSubmit}>
					<br></br>
						<input className="radio" type='radio' id='radio-1' name='color' value=' red '></input>&emsp;&emsp;
						<label className="light-label" htmlFor="radio-1"></label>
						<input className="radio" type='radio' name='color' id='radio-2' value='yellow'></input>&emsp;&emsp;
						<label className="light-label" htmlFor="radio-2"></label>
						<input className="radio" type='radio' name='color' id='radio-3' value='green'></input>&emsp;&emsp;
						<label className="light-label" htmlFor="radio-3"></label>
					<br></br><br></br>
					<label>Optional Comments:&nbsp;</label>
					<input type='text' name='feedback' value={this.state.feedback} placeholder='...feedback' onChange={this.handleChange}></input>
					<br></br><br></br>
 					<input className="btn btn-outline-primary" type="submit" value="Submit"></input>
					<br></br><br></br>
					</form>
				</Fragment> : <Fragment>
					<br></br>
					{!!this.state.error ? 
						<Fragment>
						<h4>{this.state.error}</h4>
						<p>Please try again</p><br></br>
						<button className='btn btn-outline-primary' onClick={() => this.setState({form: true})}>Return to Form</button>
						<br></br>
					</Fragment>
					:
					<Fragment>
						<h4>Your answer has been submitted.</h4>
						<p>Submit another response?</p><br></br>
						<button className='btn btn-outline-primary' onClick={() => this.setState({form: true})}>Show Form</button>
						<br></br>
					</Fragment> }
				</Fragment> }
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		current_user: state.students.current_user,
		current_course: state.courses.current_course,
		error: state.responses.error
	}
}

const mapDispatchToProps = dispatch => {
	return {
		onPostResponse: (newResponse) => postResponse(newResponse)(dispatch)
	}
}
	
export default connect(mapStateToProps, mapDispatchToProps)(TrafficForm)