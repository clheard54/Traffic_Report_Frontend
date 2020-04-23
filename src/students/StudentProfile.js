import React from 'react'
import TrafficForm from '../components/TrafficForm'
import { api } from '../services/api'

export default class StudentProfile extends React.Component{

    render(){
        return (
            <div>
                <AssignmentsContainer/>
                <TrafficForm/>
                //link to personal data chart
            </div>
        )
    }
}