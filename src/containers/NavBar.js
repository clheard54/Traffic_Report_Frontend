import React, {Fragment} from 'react'
import { NavLink, Link, Redirect } from 'react-router-dom'
import { api } from '../services/api'
import { connect } from 'react-redux'
import { userLogout, currentCourse } from '../redux'
import '../assets/bootstrap.css'


class NavBar extends React.Component{
    constructor(){
        super()
        this.state = {
            courses: []
        }
    }

    componentWillReceiveProps() {
        let userCourses = []
        api.getRequests.getCourses(this.props.current_user)
        .then(data => {
            if (data.length > 0){
                data.forEach(course => {
                    let students = course.students.map(student => student.id)
                    if (students.includes(this.props.current_user.id)) {
                        userCourses.push(course)}
                })
                this.setState({
                    courses: userCourses
                })
            } 
        })
    }

    handleLogout = () => {
        this.props.userLogout();
    }

    setCourse = (course) => {
        this.props.setCurrentCourse(course)
    }

    render(){
        return (
            <nav className="navbar navbar-light bg-light">
            <Link to={localStorage.getItem('token') ? '/profile' : '/'}><h2 className="navbar-brand">Traffic Controller</h2></Link>
            
            <div className="navbar-expand" id="navbarNavDropdown">
                <ul className="navbar-nav">
                {this.props.current_user.id ?
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Course List
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    {/* {this.state.courses ? this.state.courses.map(course => {
                        return (<a key={course.id} className="dropdown-item" name={{...course}} href={`/courses/${course.id}`}>{course.title}</a> )
                    }) : "No courses yet entered"} */}
                    {this.state.courses ? this.state.courses.map(course => {
                        return (<Link className="dropdown-item" onClick={course => this.setCourse} to={{pathname: `/courses/${course.id}`,
                            state: {course}
                        }}>{course.title}</Link>)}) : "No courses yet entered"}
                    </div>
                </li> : <li className="nav-item active">
                    <a className="nav-link" href="https://flatironschool.com/">School Website <span className="sr-only">(current)</span></a>
                </li>}
                {this.props.current_user.id ?
                <li className="nav-item">
                    <a className="nav-link" href="/profile">Profile</a>
                </li> : null }

                <li className="nav-item">
                    <a className="nav-link" href="/">Home</a>
                </li>
                {this.props.current_user.id ?
                <li className="nav-item">
                    <a onClick={this.handleLogout}className="nav-link" href="/">Logout</a>
                </li> :
                <Fragment>
                    <li>
                        <a className="nav-link" href="/login">Login</a>
                    </li>
                    <li>
                        <a className="nav-link" href="/signup">Create Account</a>
                    </li>
                    <li className="nav-item">
                    <a onClick={this.handleLogout}className="nav-link" href="/">Logout</a>
                </li>
                </Fragment> }
                </ul>
            </div>
            </nav>
        )
    }
}

const mapStateToProps = state => {
    return {
      current_user: state.students.current_user,
      courses: state.courses.courses
    }
  }

const mapDispatchToProps = dispatch => {
    return {
        userLogout: () => dispatch(userLogout()),
        setCurrentCourse: course => dispatch(currentCourse(course)),
    }
}
  
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);