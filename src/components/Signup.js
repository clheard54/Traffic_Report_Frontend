import React from 'react'

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
      <div className='container' style={{'borderStyle': 'solid', 'borderWidth': '7px', 'borderColor': '#ffc107','padding': '50px 20px', 'width': '60%'}}>
        {/* CHECK FOR ERRORS ? <h3>Error! This username has already been taken. Please try again.</h3> : <h3>Enter the information below to create an account.</h3>} */}
        <form id="event-form" onSubmit={this.handleSubmit}>
          <h3 className="font-weight-bolder">Create an Account:</h3><br></br>
            <label>Name:</label><br></br>
            <input type='text' placeholder="name" name='name'/><br></br>
            <br></br>
            <label>Username:</label><br></br>
            <input type='text' placeholder='username' name='username'/>
            <br></br>
            <br></br>
            <label>Password:</label>
            <br></br>
            <input type='password' placeholder='password' name='password'/><br></br>
            <br></br>
            <br></br>
            <label className="font-weight-bolder">If you are a teacher, enter </label><br></br><label className="font-weight-bold">the administrator access code below:</label><br></br>
            <input type='password' name='adminCode'></input>
            <br></br>
            <br></br>
            <input className="btn btn-success" type="submit" ></input>
        </form>
      </div>
    )
  }

}

