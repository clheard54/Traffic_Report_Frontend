import React from 'react'
import { api } from '../services/api'
import TodaysData from '../data_charts/TodaysData'
import AuthHOC from "../HOCs/AuthHOC";
import WeekAvgs from '../data_charts/WeekAvgs'
import WeekTotal from '../data_charts/WeekTotal'
import AssignmentsContainer from '../components/AssignmentsContainer'

class TeacherProfile extends React.Component{

    render(){
        return (
            <div>
                <h2>Hello Teacher</h2>
                <AssignmentsContainer/>
                <WeekAvgs/>
                <WeekTotal/>
                <TodaysData />
                {null/*link to personal data chart*/}
            </div>
        )
    }
}

export default TeacherProfile