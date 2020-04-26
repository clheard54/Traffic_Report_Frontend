import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import AssignmentsContainer from '../components/AssignmentsContainer'
import IndividualData from '../data_charts/IndividualData'
import TrafficForm from '../components/TrafficForm'
import { findByLabelText } from '@testing-library/react'

class StudentClass extends React.Component{


    render(){
        return (
          <div>
            <div>
            <h3>{this.props.current_course.title}</h3>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%'}}>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-3" style={{'borderStyle': 'solid', 'borderWidth': '3px', 'borderColor': 'var(--gray-dark)', 'padding': '15px'}}>
                        <AssignmentsContainer/>
                    </div>
                    <div className='col-md-8'>
                      <TrafficForm/>
                    </div>  
                    <div className='col-sm-.5'></div>
                  </div>
                </div>
                <br></br>
            </Fragment>
            <hr></hr>
            <br></br>
              <IndividualData/> 
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