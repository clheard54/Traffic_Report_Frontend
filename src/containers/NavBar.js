import React, {Fragment} from 'react'
import { NavLink, Link } from 'react-router-dom'
import { api } from '../services/api'
import { connect } from 'react-redux'
import { userLogout } from '../redux'
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
                console.log(userCourses)
                this.setState({
                    courses: userCourses
                })
            } else {
                console.log("no courses")
            }
        })
    }

    handleLogout = () => {
        this.props.userLogout();
        this.props.history.push('/')
    }


    render(){
        return (
            <nav className="navbar navbar-light bg-light">
            <Link to='/'><h2 className="navbar-brand">Traffic Controller</h2></Link>
            
            <div className="navbar-expand" id="navbarNavDropdown">
                <ul className="navbar-nav">
                {this.props.current_user.id ?
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Course List
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    {this.state.courses.map(course => {
                        return (<a key={course.id} className="dropdown-item" href={`/courses/${course.id}`} onClick={this.getResponses}>{course.title}</a> )
                    })}
                    {/* <a className="dropdown-item" href="#">Geometry</a>
                    <a className="dropdown-item" href="www.google.com">Algebra II</a>
                    <a className="dropdown-item" href="www.google.com">PreCalculus</a> */}
                    </div>
                </li> : <li className="nav-item active">
                    <a className="nav-link" href="https://flatironschool.com/">School Website <span className="sr-only">(current)</span></a>
                </li>}

                <li className="nav-item">
                    <a className="nav-link" href="/">Home</a>
                </li>
                {this.props.current_user.id ?
                <li className="nav-item">
                    <a onClick={this.handleLogout}className="nav-link" href="/logout">Logout</a>
                </li> :
                <Fragment>
                    <li>
                        <a className="nav-link" href="/login">Login</a>
                    </li>
                    <li>
                        <a className="nav-link" href="/signup">Create Account</a>
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
        userLogout: () => dispatch(userLogout())
    }
}
  
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);