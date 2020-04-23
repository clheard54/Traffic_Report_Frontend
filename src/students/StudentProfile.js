import React from 'react'
import AssignmentsContainer from '../components/AssignmentsContainer'
import { api } from '../services/api'

export default class StudentProfile extends React.Component{

    render(){
        return (
            <div>
                <AssignmentsContainer/>
                //link to personal data chart
            </div>
        )
    }
}