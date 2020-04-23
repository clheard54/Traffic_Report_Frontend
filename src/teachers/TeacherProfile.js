import React from 'react'
import { api } from '../services/api'
import TodaysData from '../data_charts/TodaysData'

export default class TeacherHome extends React.Component{

    render(){
        return (
            <div>
                <AssignmentsContainer/>
                <WeekAvgs/>
                <WeekTotal/>
                <TodaysData />
                {/*link to personal data chart*/}
            </div>
        )
    }
}