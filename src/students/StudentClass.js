import React from 'react'
import { api } from '../services/api'
import TodaysData from '../data_charts/TodaysData'
import AssignmentsContainer from '../components/AssignmentsContainer'
import IndividualData from '../data_charts/IndividualData'

export default class StudentClass extends React.Component{

    render(){
        return (
          <div>
            <div>
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