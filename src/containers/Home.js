import React from 'react'

export default class Home extends React.Component{
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
    }

    render(){
        return(
            <div className='container'>
                <form onSubmit={this.handleSubmit}>
                <div className="form-group"></div>
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