import React from 'react'
import { api } from '../services/api'

const INITIAL_STATE = {
  user: {
    name: '',
    username: '',
    password: ''
  },
  adminCode: '',
  adminError: null,
  errors: null, 
}

export default class Signup extends React.Component {
  state = INITIAL_STATE

  handleChange = (event) => {
    let newState = {
      ...this.state,
      user: {
        ...this.state.user,
        [event.target.name]: event.target.value
    } 
  }
    this.setState(newState)
}

  goToLogin = () => {
    this.props.history.push('/login')
  }

  handleCodeChange = (event) => {
    this.setState({
      adminCode: event.target.value
    })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.state.adminCode == 'TeacherPassword'){
        api.auth.createTeacher(this.state.user)
        .then(data => {
           if (!!data.teacher.id){
              this.setState({...INITIAL_STATE, success: true})
          } else {
              this.setState({...INITIAL_STATE, errors: data.error})
          }
        })
      }
    if (this.state.adminCode !== 'TeacherPassword' && this.state.adminCode !== '') {
      this.setState({...INITIAL_STATE, adminError: true})
    } 
    if (this.state.adminCode == '') {
        api.auth.createStudent(this.state.user)
        .then(res => {
           if (!!res.student.id){
              this.setState({...INITIAL_STATE, success: true})
          } else {
              this.setState({...INITIAL_STATE, errors: res.error})
          }
      })
      }
    event.target.name.value = ''
    event.target.username.value = ''
    event.target.password.value = ''
    event.target.adminCode.value = ''
  }

render(){
    
    return (  
      <div className='container' style={{'borderStyle': 'solid', 'borderWidth': '7px', 'borderColor': '#ffc107','padding': '20px 20px', 'width': '60%'}}>
        <div className='container border-top-0 border-bottom-0' style={{'borderStyle': 'solid', 'borderWidth': '12px', 'borderColor': '#dc3545', 'padding':'30px 0'}}>
        {this.state.adminError ? <h5 style={{'color': 'red', 'fontWeight': 'bolder', 'width': '90%', 'margin': 'auto'}}>The admin access code you entered was not accepted! Please try again.</h5> : null}
        
        {!this.state.success ? (
        <form id="event-form" onSubmit={this.handleSubmit}>
          <h3 className="font-weight-bolder">Create an Account:</h3><br></br>
          {this.state.errors ? <h5 style={{'color': 'red'}}>{this.state.errors} Please try again.</h5> : null}
            <label>Name:</label><br></br>
            <input type='text' placeholder="name" name='name' value={this.state.name} onChange={this.handleChange}/><br></br>
            <br></br>
            <label>Username:</label><br></br>
            <input type='text' placeholder='username' name='username' value={this.state.username} onChange={this.handleChange}/>
            <br></br>
            <br></br>
            <label>Password:</label>
            <br></br>
            <input type='password' placeholder='password' name='password' value={this.state.password} onChange={this.handleChange}/><br></br>
            <br></br>
            <br></br>
            <label className="font-weight-bolder">If you are a teacher, enter </label><br></br><label className="font-weight-bold">the administrator access code below:</label><br></br>
            <input type='password' name='adminCode' value={this.state.adminCode} onChange={this.handleCodeChange}></input>
            <br></br>
            <br></br>
            <input className="btn btn-success" type="submit" ></input>
        </form> ) : <div>
          <br></br>
          <h4 className="font-weight-bolder">Success!</h4>
          <p style={{'fontSize': '18px'}}>Head to the Login page to see your account.</p>
          <button className="btn btn-success" onClick={this.goToLogin}>Go to Log In</button>
        </div> }
        </div>
      </div>
    )
  }

}

