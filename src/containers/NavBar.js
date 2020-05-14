import React, {Fragment} from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { userLogout, currentCourse, setUserCourses } from '../redux'
import '../assets/bootstrap.css'


class NavBar extends React.Component{

    componentDidMount(){
        if (this.props.current_user){
        this.props.setUserCourses(this.props.current_user)
        }
    }

    componentDidUpdate(prevProps){
        if (prevProps.current_user !== this.props.current_user){
            this.props.setUserCourses(this.props.current_user)
        }
    }

    listCourses = () => {
        return this.props.user_courses.map(course => {
            return (<Link className="dropdown-item" onClick={() => this.setCourse(course)} key={course.id} to={{pathname: `/courses/current`,
                state: {course}
            }}>{course.title}</Link>)})
    }

    handleLogout = () => {
        this.props.userLogout();
    }

    setCourse = (course) => {
        localStorage.setItem('course_token', course.id)
        this.props.setCurrentCourse(course);
    }

    render(){
        // {this.props.setUserCourses(this.props.current_user)}
        return (
            <nav className="navbar navbar-light bg-light">
            <Link to={localStorage.getItem('token') ? '/profile' : '/'}><h2 className="navbar-brand">Traffic Controller</h2></Link>
            
            {/* Access to Course List if signed in */}
            <div className="navbar-expand" id="navbarNavDropdown">
                <ul className="navbar-nav">
                {this.props.current_user ?
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Course List
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    
                    {this.props.user_courses ? this.listCourses() : "No courses yet entered"}
                    </div>
                </li> : <li className="nav-item active">
                    <a className="nav-link" href="https://flatironschool.com/">School Website <span className="sr-only">(current)</span></a>
                </li>}
                {this.props.current_user ?
                <li className="nav-item">
                    <a className="nav-link" href="/profile">Profile</a>
                </li> : null }

                <li className="nav-item">
                    <a className="nav-link" href="/">Home</a>
                </li>
                {this.props.current_user ?
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
      current_user: state.auths.current_user,
      user_courses: state.courses.user_courses,
      courses: state.courses.courses
    }
  }

const mapDispatchToProps = dispatch => {
    return {
        userLogout: () => dispatch(userLogout()),
        setCurrentCourse: course => dispatch(currentCourse(course)),
        setUserCourses: (user) => setUserCourses(user)(dispatch)
    }
}

  
export default connect(mapStateToProps, mapDispatchToProps)(NavBar);