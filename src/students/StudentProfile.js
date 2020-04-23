import React from 'react'
import AssignmentsContainer from '../components/AssignmentsContainer'
import { api } from '../services/api'
import AuthHOC from "../HOCs/AuthHOC";

class StudentProfile extends React.Component{

    render(){
        return (
            <div>
                <AssignmentsContainer/>
                //link to personal data chart
            </div>
        )
    }
}

export default AuthHOC(StudentProfile)