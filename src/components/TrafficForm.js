import React from 'react'
import '../assets/traffic_form.css'

export default class TrafficForm extends React.Component{
	constructor(){
		super();
		this.state = {
			answer: '',
			datatype: 'light',
			courses_student_id: ''
		}
	}

	handleSubmit = (event) => {
		event.preventDefault();
		let newResponse = {
			answer: event.target.color.value,
			datatype: 'color',
			day: new Date().toLocaleDateString(),
			courses_student_id: '' //PULL FROM STATE!
		}
		// api.posts.postResponse(newResponse)
	}

	render(){
		return (
			<div className='light-container border border-secondary'>
			How do you feel about the material covered in class today?<br></br>
					Red: STOP, I am so confused.<br></br>
					Yellow: Meh, I kind of know what's going on, but I'm not sure I really understand this.<br></br>
					Green: Great! Feeling good and ready to move on.<br></br>
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
			</div>
		)
	}
}


	