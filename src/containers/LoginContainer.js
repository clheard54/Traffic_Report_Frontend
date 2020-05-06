import React, { Fragment } from 'react'
import Login from  "../components/Login"

export default class LoginContainer extends React.Component{
    render() {
        return (
            <Fragment>
                <br></br>
            <div className='container' id='login-box' style={{'width': '70%'}}>
                <div className='container border-top-0 border-bottom-0' id="signup-inset">
                    <Login {...this.props}/>
                </div>
            </div>
            <div style={{'display': 'flex', 'position': 'absolute', 'bottom': '25px'}}>
                    <img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img><img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
            </div>
            </Fragment>
        )
    }
}


        