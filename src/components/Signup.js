import React from 'react'
import {api} from '../services/api'
import { addStudent } from "../redux";

export default class Signup extends React.Component {

handleSubmit = (event) => {
    event.preventDefault();
    if (event.target.adminCode == 'TeacherPassword'){
        this.props.onCreateTeacher(event);
    } else {
        this.props.onCreateStudent(event);
    }
    event.target.name.value = ''
    event.target.username.value = ''
    event.target.password.value = ''
    event.target.adminCode.value = ''
    // this.props.history.push('/SOMEWHERE')
}

render(){
    
    return (  
      <div id="signup">
        {/* CHECK FOR ERRORS ? <h3>Error! This username has already been taken. Please try again.</h3> : <h3>Enter the information below to create an account.</h3>} */}
        <form id="event-form" onSubmit={this.handleSubmit}>
            <label>Name</label><br></br>
            <input type='text' placeholder="name" name='name'/><br></br><label>Username</label><br></br>
            <input type='text' placeholder='username' name='username'/>
            <br></br>
            <br></br>
            <label>Password</label>
            <br></br>
            <input type='password' placeholder='password' name='password'/><br></br>
            <br></br>
            <br></br>
            <label>Enter administrator access code below if you are a teacher:</label>
            <input type='password' name='adminCode'></input>
            <input className="page-button" type="submit" ></input>
        </form>
      </div>
    )
  }

}

