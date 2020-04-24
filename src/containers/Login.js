import React from 'react'
import { api } from '../services/api'

export default class Login extends React.Component{
    constructor(){
        super();
        this.state = {
            user: {
                username: '',
                password: ''
            }
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
        //LOGIN METHOD
        api.auth.login(this.state).then(res => {
            if (!res.errors){
                this.props.onLogin(res);
                console.log('go to profile')
                this.props.history.push('/profile')
            } else {
                this.setState({errors: true})
                // this.props.history.push('/login')
            }
        })
    }

    render(){
        return(
            <div className='container' style={{'borderStyle': 'solid', 'borderWidth': '7px', 'borderColor': '#ffc107','padding': '50px 20px'}}>
                <form onSubmit={this.handleSubmit}>
                    <h3 className="font-weight-bolder">Log In:</h3><br></br>
                    <label>Username:  </label>
                    <input type="text" name="username" value={this.state.username} onChange={this.handleChange}></input><br></br>
                    <label>Password:  </label>
                    <input type="password" name="password" value={this.state.password} onChange={this.handleChange}></input>
                    <br></br>
                    <br></br>
                    <input className="btn btn-success" type="submit" value="Log In"></input>
                </form>
            </div>
        )
    }
}