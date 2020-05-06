import React from 'react';
import './App.css';
import './assets/bootstrap.css'
import '@popperjs/core'
import { connect } from "react-redux";
import {BrowserRouter as Router, Route } from 'react-router-dom'
import { api } from './services/api'
import LandingPage from './containers/LandingPage'
import NavBar from './containers/NavBar'
import LoginContainer from './containers/LoginContainer'
import Signup from './components/Signup';
import UserHome from './containers/UserHome';
import ClassPage from './containers/ClassPage';
import AddCourseForm from './components/AddCourseForm'
import TrafficForm from './components/TrafficForm';
import DailyAvgs from './teachers/DailyAvgs'
import { setTeacherUser, setTeacher, setStudentUser, setStudent, currentCourse } from './redux';

class App extends React.Component{
  constructor(){
    super();
    this.state = {
      errors: false
    }
  }

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token) {
      // make a request to the backend and find our user
      api.auth.getCurrentUser().then(user => {
        user.admin ? this.props.onSetTeacherUser(user) : this.props.onSetStudentUser(user)
      });
    }
    const course_token = localStorage.getItem('course_token');
    if (course_token) {
          api.getRequests.getCourses().then(data => {
              let thisCourse = data.find(course => course.id == parseInt(course_token));
              this.props.setCurrentCourse(thisCourse) 
          })
        }
    }

  render(){
    return (
        <div className="App">
        <Router>
          <header>
            <div className="traffic-top" style={{'margin': '0'}}>
              <span className="dot" id='red-dot'></span>
              <span className="dot" id='yellow-dot'></span>
              <span className="dot" id='green-dot'></span>
            </div>
            <NavBar className='navbar' user={this.props.current_user}/>
            <div className="traffic-bottom"></div>
          </header>
          <div className = "main">

            <Route
              exact
              path="/login"
              render={props => <LoginContainer {...props} />}/>

            <Route
              exact
              path="/signup"
              render={props => <Signup {...props} onCreateTeacher={this.createTeacher} onCreateStudent={this.createStudent}/>}/>

            <Route 
            exact 
            path="/profile" 
            render={props => <UserHome {...props}  user={this.props.current_user}/>}
            />

            <Route 
            exact 
            path="/daily_avgs" 
            render={props => <DailyAvgs {...props}/>}
            />
 
            <Route 
              exact
              path='/' 
              render={props => <LandingPage {...props}/>} /> 
      
            <Route
              exact
              path="/courses/current"
              render={props => <ClassPage {...props} course={this.props.current_course}/>}
            />    

            <Route 
              exact
              path='/traffic' 
              render={props => <TrafficForm {...props}/>}

              />

            <Route 
              exact
              path='/add_course' 
              render={props => <AddCourseForm {...props}/>}

              />

            </div>
            </Router>
          <br></br>
        </div>
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onSetTeacherUser: teacher => dispatch(setTeacher(teacher), ()=> dispatch(setTeacherUser(teacher))),
    onSetStudentUser: student => dispatch(setStudent(student), () => dispatch(setStudentUser(student))),
    setCurrentCourse: course => dispatch(currentCourse(course))
    // fetchCourses: user => dispatch(fetchCourses(user))
  }
}

const mapStateToProps = state => {
  return {
    current_user: state.students.current_user,
    current_course: state.courses.current_course
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);