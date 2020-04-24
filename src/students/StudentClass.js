import React from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import AssignmentsContainer from '../components/AssignmentsContainer'
import IndividualData from '../data_charts/IndividualData'
import TrafficForm from '../components/TrafficForm'

class StudentClass extends React.Component{

    
    render(){
        return (
          <div>
            <div>
            <h3>{this.props.current_course.title}</h3>
              <AssignmentsContainer/>
              <TrafficForm/>
            </div>
            <div>
              <IndividualData/> 
            </div>
          </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_course: state.students.current_course
    }
}

export default connect(mapStateToProps)(StudentClass)