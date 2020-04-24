import React, { Fragment } from 'react'
import Login from './Login'
import { Redirect } from 'react-router-dom'

export default class LandingPage extends React.Component{

    handleClick = () => {
        this.props.history.push('/signup')
        }
      
    componentDidMount(){
      console.log(this.props)
    }

  render(){
    return (
        <Fragment>
          <h2>Welcome!</h2>
          <p>Please Log In or Sign Up below.</p>
            <br></br>
            <div className="container">
            <div className="row">
                <div className ="col-md-8">
                    <div className="container" style={{'borderStyle': 'solid', 'borderWidth': '7px', 'borderColor': '#dc3545', 'position': 'relative', 'right': '10%'}}>
                    <img id="schoool" src="https://www.voicesofyouth.org/sites/default/files/images/2019-03/school.jpg" alt='school'></img>
                </div>
                </div>
                {/* <div className="col-sm-1"></div> */}
                <div className ="col-md-4">
                <Login {...this.props} />
                <br></br>
                <span style={{'fontSize': '110%'}} >No Account?  </span>
                <button className='btn btn-outline-success btn-sm font-weight-bolder' onClick={this.handleClick}>Create One Here</button>
                </div>
                <div className="col-sm-1"></div>
            </div>
        </div>
    </Fragment>
    );
  }
}

