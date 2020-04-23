import React from 'react';
import './App.css';
// import './assets/traffic_form.css'
import './assets/bootstrap.css'
import '@popperjs/core'
import NavBar from './containers/NavBar'
import Home from './containers/Home'
import TodaysData from './data_charts/TodaysData'
import TrafficForm from './components/TrafficForm';

class App extends React.Component{

  /*
  login = data => {
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

  createTeacher = (event) => {
  let newTeacher = {
    username: event.target.username.value,
    password: event.target.password.value,
    admin: true
  }
  api.auth.createTeacher(newTeacher).then(res => {
    console.log(res)
     if (!!res.teacher.id){
        this.login(res);
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
        this.setState({errors: false})
    } else {
        this.setState({errors: true})
    }
})
}
  */

  render(){
    return (
      <div className="App">
        <NavBar/>
        <Home />
        <TodaysData/>
        <br></br>
        <TrafficForm/>
      </div>
    );
  }
}

export default App;
