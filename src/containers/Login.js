import React from 'react'
import { userLogin, setUserCourses } from  "../redux"
import { connect } from 'react-redux';

class Login extends React.Component{
    constructor(){
        super();
        this.state = {
            user: {
                username: '',
                password: ''
            }
        }
    }

    componentWillUpdate() {
        if (!!localStorage.getItem('token')){
            this.props.history.push('/profile')
        }
    }

    handleChange = (event) => {
        const newState = {...this.state.user, [event.target.name]: event.target.value}
        this.setState({
                user: newState
        })      
    }

    handleSubmit = (event) => {
        event.preventDefault()
        this.props.onSetUser(this.state, () => this.props.setUserCourses(this.props.current_user))
        event.target.username.value = ''
        event.target.password.value = ''
    }

    render(){
        return(
            <div className='container' style={{'borderStyle': 'solid', 'borderWidth': '7px', 'borderColor': '#ffc107','padding': '50px 20px'}}>
                <form onSubmit={this.handleSubmit}>
                {!!this.props.error ? <p style={{'color': 'red'}}>{this.props.error}. Please try again.</p> : null}
                    <h3 className="font-weight-bolder">Log In:</h3><br></br>
                    <label>Username: </label>
                    <input type="text" name="username" value={this.state.username} onChange={this.handleChange}></input><br></br>
                    <label>Password:</label>
                    <input type="password" name="password" value={this.state.password} onChange={this.handleChange}></input>
                    <br></br>
                    <br></br>
                    <input className="btn btn-success" type="submit" value="Log In"></input>
                </form>
            </div>
        )
    }
}


const mapStateToProps = state => {
    return {
        current_user: state.students.current_user,
        error: state.auths.error
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSetUser: (user) => userLogin(user)(dispatch),
        setUserCourses: (user) => setUserCourses(user)(dispatch)
    } 
}

export default connect(mapStateToProps, mapDispatchToProps)(Login)