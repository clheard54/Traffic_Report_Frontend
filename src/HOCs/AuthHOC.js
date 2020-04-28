import React from 'react'
import { Redirect } from 'react-router-dom'
import {api} from "../services/api"

const AuthHOC = WrappedComponent => {

    return class AuthHOC extends React.Component{

        state={
            authorized: false,
            responseCollected: false
        }

        componentDidMount(){
            this.checkLogin()
        }

        checkLogin = () => {
            if (!localStorage.getItem('token')){
                this.setState({
                    authorized: false,
                    responseCollected: true
                })
            } else {
                api.auth.getCurrentUser()
                .then(resp => {
                    if (resp.error){
                        this.setState({
                            authorized: false,
                            responseCollected: true
                        })
                    } else {
                        this.setState({
                            authorized: true,
                            responseCollected: true
                        })
                    }
                })
            }
        }
    

        isAuthorized = () => {
            return this.state.authorized
        }

        isRejected = () => {
            return !this.state.authorized && this.state.responseCollected
        }

        render(){
          return (
            <div>
                {this.state.authorized ? (<WrappedComponent {...this.props}/>) : null} 
            </div>)
        }
    }
}

export default AuthHOC