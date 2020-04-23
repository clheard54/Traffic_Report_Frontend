import React from 'react'
import { api } from '../services/api'

export default class Login extends React.Component{
    constructor(){
        super();
        this.state = {
            username: '',
            password: ''
        }
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        })
    }

    handleSubmit = (event) => {
        event.preventDefault()
        //LOGIN METHOD
        api.auth.login(this.state).then(res => {
            if (!res.errors){
                this.props.onLogin(res);
                this.props.history.push('/profile')
            } else {
                this.setState({errors: true})
                this.props.history.push('/login')
            }
        })
    }

    render(){
        return(
            <div className='container'>
                <form onSubmit={this.handleSubmit}>
                    <label>Username:  </label>
                    <input type="text" name="username" value={this.state.username} onChange={this.handleChange}></input><br></br>
                    <label>Password:  </label>
                    <input type="password" name="password" value={this.state.password} onChange={this.handleChange}></input>
                    <br></br>
                    <input type="submit" value="Log In"></input>
                </form>
            </div>
        )
    }
}