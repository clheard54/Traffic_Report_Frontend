import React from 'react';
import './App.css';
// import './assets/traffic_form.css'
import './assets/bootstrap.css'
import '@popperjs/core'
import store from "./redux/store";
import { Provider } from "react-redux";
import { connect } from "react-redux";
import {BrowserRouter as Router, Route, Link} from 'react-router-dom'
import { setStudentUser, setTeacherUser } from "../redux";
import { api } from './services/api'
import NavBar from './containers/NavBar'
import StudentProfile from './students/StudentProfile'
import Login from './containers/Login'
import TodaysData from './data_charts/TodaysData'
import TrafficForm from './components/TrafficForm';
import Signup from './components/Signup';

class App extends React.Component{
  constructor(){
    super();
    this.state = {
      errors: false
    }
  }

  /*
  login = data => {
    console.log(data)
    if (!!data.user){
    const updatedState = { user: {id: data.user.id,  username: data.user.username}};
    localStorage.setItem("token", data.jwt);
    this.setState({ 
      auth: updatedState
    });
  }
  };
  
  logout = () => {
    localStorage.removeItem("token");
    this.setState({
      auth: { user: {} },
      errors: null,
      events: []
    });
  };
  */

  createTeacher = (event) => {
  let newTeacher = {
    username: event.target.username.value,
    password: event.target.password.value,
    admin: true
  }
  api.auth.createTeacher(newTeacher).then(resp => resp.json())
  .then(data => {
    console.log(data)
     if (!!data.teacher.id){
        this.login(data);
        this.props.onSetTeacherUser(data)
        this.setState({errors: false})
    } else {
        this.setState({errors: true})
    }
})
}

createStudent = (event) => {
  let newStudent = {
    username: event.target.username.value,
    password: event.target.password.value
  }
  api.auth.createStudent(newStudent).then(res => {
    console.log(res)
     if (!!res.student.id){
        this.login(res);
        this.props.onSetStudentUser(res)
        this.setState({errors: false})
    } else {
        this.setState({errors: true})
    }
})
}

  render(){
    return (
      <Provider store={store}>
        <div className="App">
        <Router>
          <header className="App-header">
            <Link to='/'><h1>Traffic Controller</h1></Link>
            <NavBar className='navbar' logout={this.logout} user={this.props.current_user}/>
          </header>
          <div className = "main">
            <Route
              exact
              path="/login"
              render={props => <Login {...props} onLogin={this.login} />}/>

            <Route
              exact
              path="/signup"
              render={props => <Signup {...props} onCreateTeacher={this.createTeacher} onCreateStudent={this.createStudent}/>}/>

            <Route 
            exact 
            path="/student_profile" 
            render={props => <StudentProfile {...props}  user={this.props.current_user}/>}
            />
{/* 
            <Route 
              exact
              path='/admin_profile' 
              render={props => <TeacherHome {...props} user={this.props.current_user} />} />   */}
      
            <Route
              exact
              path="/"
              render={props => <Login {...props}/>}
            />     
            <TodaysData/>
            <TrafficForm/>
            </div>
            </Router>
          <br></br>
        </div>
      </Provider>
    )
  }
}


const mapDispatchToProps = dispatch => {
  return {
    onSetTeacherUser: (teacher) => dispatch(setTeacherUser(teacher)),
    onSetStudentUser: (student) => dispatch(setStudentUser(student))
  }
}

const mapStateToProps = state => {
  return {
    current_user: state.current_user
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);