import React, { Fragment } from 'react'
import Login from './Login'
import { Redirect } from 'react-router-dom'

export default class LandingPage extends React.Component{

    handleClick = () => {
        this.props.history.push('/signup')
        }


  render(){
    return (
        <Fragment>
          <h2>Welcome!</h2>
          {!localStorage.getItem('token') ?
          <p>Please Log In or Sign Up below.</p> : null }
            <br></br>
            <div className="container">
            <div className="row">
                <div className ="col-md-8">
                    <div className="container" id='landing'>
                    <img id="schoool" src="https://www.voicesofyouth.org/sites/default/files/images/2019-03/school.jpg" alt='school'></img>
                </div>
                </div>
                {/* <div className="col-sm-1"></div> */}
                <div className ="col-md-4">
                {localStorage.getItem('token') ? 
                <Fragment>
                <br></br>
                <h3 style={{'color': '#ffc107'}}>You are Logged In!</h3>
                <br></br>
                <button className='btn btn-outline-success btn-lg font-weight-bolder' onClick={() => this.props.history.push('/profile')} >Go to Profile</button>
                </Fragment> :
                <Fragment>
                  <Login {...this.props} />
                  <br></br>
                  <span style={{'fontSize': '110%'}} >No Account?  </span>
                  <button className='btn btn-outline-success btn-sm font-weight-bolder' onClick={this.handleClick}>Create One Here</button>
                </Fragment> }
                </div>
                <div className="col-sm-1"></div>
            </div>
        </div>
    </Fragment>
    );
  }
}

