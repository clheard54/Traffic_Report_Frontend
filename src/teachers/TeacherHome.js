import React from 'react'
import { api } from '../services/api'

export default class TeacherHome extends React.Component{

    render(){
        return (
            <div>
                <AssignmentsContainer/>
                {/*link to personal data chart*/}
            </div>
        )
    }
}