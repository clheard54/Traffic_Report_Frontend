import React, {Fragment } from 'react'
import '../assets/traffic_form.css'
import { connect } from 'react-redux'
import { postResponse } from '../redux'

class TrafficForm extends React.Component{
	constructor(){
		super();
		this.state = {
			form: true
		}
	}

	handleSubmit = (event) => {
		event.preventDefault();
		let myAnswer = event.target.color.value
		let newResponse = {
			response: {
				answer: myAnswer,
				datatype: 'color',
				day: '',
				courses_student_id: this.props.course_student.id
			}
		}
		this.props.onPostResponse(newResponse)
		this.setState({
			form: false
		})
	}

	render(){
		return (
			<div className='light-container' style={{'border': '2px solid black', 'margin': 'auto'}}>
			{this.state.form ? <Fragment>
				<h4>Traffic Check:</h4>
				How do you feel about the material covered in class today?<br></br>
					<span style={{'color': '#EA4335'}}>Red:</span> STOP, I am so confused.<br></br>
					<span style={{'color': 'rgb(248, 200, 54)'}}>Yellow:</span> Meh, I kind of know what's going on, but I'm not sure I really understand this.<br></br>
					<span style={{'color': '#34A853'}}>Green:</span> Great! Feeling good and ready to move on.<br></br>
				<form onSubmit={this.handleSubmit}>
					<br></br>
						<input className="radio" type='radio' id='radio-1' name='color' value=' red '></input>&emsp;&emsp;
						<label className="light-label" htmlFor="radio-1"></label>
						<input className="radio" type='radio' name='color' id='radio-2' value='yellow'></input>&emsp;&emsp;
						<label className="light-label" htmlFor="radio-2"></label>
						<input className="radio" type='radio' name='color' id='radio-3' value='green'></input>&emsp;&emsp;
						<label className="light-label" htmlFor="radio-3"></label>
					<br></br><br></br>
					<input className="btn btn-secondary" type="submit" value="Submit"></input>
					</form>
				</Fragment> : <Fragment>
					<br></br>
					<h4>Your answer has been submitted.</h4>
					<p>Submit another response?</p><br></br>
					<button className='btn btn-secondary' onClick={() => this.setState({form: true})}>Show Form</button>
				</Fragment> }
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		current_user: state.students.current_user
	}
}

const mapDispatchToProps = dispatch => {
	return {
		onPostResponse: (newResponse) => postResponse(newResponse)(dispatch)
	}
}
	
export default connect(mapStateToProps, mapDispatchToProps)(TrafficForm)