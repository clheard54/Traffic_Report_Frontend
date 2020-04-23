import React, {Fragment} from 'react'
import { NavLink } from 'react-router-dom'
import { api } from '../services/api'
import { connect } from 'react-redux'
import '../assets/bootstrap.css'


class NavBar extends React.Component{
    constructor(){
        super()
        this.state= {
            courses: []
        }
    }

    componentDidMount(){
        const user = this.props.current_user
        api.getRequests.getCourses(user).then(data => {
            if (data.length > 0){
            this.setState({
                courses: data.filter(course => course.students.includes(user))
          })
        }
        })
    }

    render(){
        return (
            <nav className="navbar navbar-light bg-light">
            <h3 className="navbar-brand">Traffic Controller</h3>
            <div className="navbar-expand" id="navbarNavDropdown">
                <ul className="navbar-nav">
                {!!localStorage.getItem('token') ?
                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Course List
                    {/* RENDER DYNAMICALLY BY QUERYING BACKEND? */}
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                    {this.state.courses.map(course => {
                        return (<a className="dropdown-item" href={`/courses/${course.id}`}>{course.title}</a> )
                    })}
                    {/* <a className="dropdown-item" href="#">Geometry</a>
                    <a className="dropdown-item" href="www.google.com">Algebra II</a>
                    <a className="dropdown-item" href="www.google.com">PreCalculus</a> */}
                    </div>
                </li> : <li className="nav-item active">
                    <a className="nav-link" href="https://flatironschool.com/">School Website <span className="sr-only">(current)</span></a>
                </li>}

                <li className="nav-item">
                    <a className="nav-link" href="www.google.com">Home</a>
                </li>
                {!!localStorage.getItem("token") ?
                <li className="nav-item">
                    <a onClick={this.props.logout}className="nav-link" href="/logout">Logout</a>
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
      current_user: state.current_user,
    }
  }
  
export default connect(mapStateToProps)(NavBar);