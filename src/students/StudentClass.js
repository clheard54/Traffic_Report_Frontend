import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import AssignmentsContainer from '../components/AssignmentsContainer'
import IndividualData from '../data_charts/IndividualData'
import TrafficForm from '../components/TrafficForm'
import { findByLabelText } from '@testing-library/react'
import QuestionBoard from '../containers/QuestionBoard'

class StudentClass extends React.Component{
   constructor(){
    super();
    this.state = {
      show: false,
      questions: []
    }
}

    render(){
        return (
          <div>
            <div>
            <h3>{this.props.current_course.title}</h3>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%', 'minHeight': '530px'}}>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-3" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                        <AssignmentsContainer/>
                    </div>
                    <div className='col-md-8'>
                      <TrafficForm/>
                    </div>  
                    <div className='col-sm-.5'></div>
                  </div>
                </div>
                <img style={{'backgroundColor': 'white', 'opacity': '0.8', 'width': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
            </Fragment>
            <hr></hr>
            <br></br>
            
                <QuestionBoard/>
                <br></br>
                <br></br>
                <hr></hr>
                <br></br>
                <br></br>
                <div className="container">
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-3">
                    <br></br>
                        <h4>Check out your recent traffic data in this course.</h4>
                    </div>
                    <div className='col-sm-1.5'></div>
                    <div className='col-md-8'>
                      <IndividualData/> 
                    </div>  
                    <div className='col-sm-.5'></div>
                  </div>
                </div>
            </div>
          </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_course: state.courses.current_course
    }
}

export default connect(mapStateToProps)(StudentClass)