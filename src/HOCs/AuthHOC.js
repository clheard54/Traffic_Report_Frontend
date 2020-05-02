import React from 'react'
import { Redirect } from 'react-router-dom'
import {api} from "../services/api"

const AuthHOC = WrappedComponent => {
console.log("auth check")
  return class AuthHOC extends React.Component{
    constructor(){
        super();
        this.state={
            authorized: false,
            received: false
        }
    }

    componentDidMount(){
        this.checkLogin()
    }

    screenUser = () => {
        if (!this.state.authorized && !this.state.received){
            return <h3>Loading...</h3>
        } else if (this.state.received && !this.state.authorized){
            return <Redirect to='/login'/>
        } else {
            return <WrappedComponent {...this.props}/>
        }
    }

    checkLogin = () => {
        if (!localStorage.getItem('token')){
            this.setState({
                received: true
            })
        } else {
            api.auth.getCurrentUser()
            .then(resp => {
                if (resp.error){
                    this.setState({
                        received: true,
                        authorized: false
                    })
                } else {
                    this.setState({
                        received: true,
                        authorized: true
                    })
                }
            })
        }
    }
    
    isAuthorized = () => {
        return this.state.authorized
    }

    render(){
        return (
        <div>
            {this.screenUser()}
        </div>)
        }
    }
}

export default AuthHOC