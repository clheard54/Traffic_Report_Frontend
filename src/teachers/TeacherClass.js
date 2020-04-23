import React from 'react'
import { api } from '../services/api'
import TodaysData from '../data_charts/TodaysData'
import AssignmentsContainer from '../components/AssignmentsContainer'
import TriageChart from '../data_charts/TriageChart'
import WeekAvgs from '../data_charts/WeekAvgs'
import WeekTotal from '../data_charts/WeekTotal'

export default class TeacherClass extends React.Component{

    render(){
        return (
          <div>
            <div>
              <AssignmentsContainer/>
              <TodaysData />
            </div>
            <div>
                <TriageChart/>
                <WeekAvgs/>
                <WeekTotal/>
                {/*link to personal data chart*/}
            </div>
          </div>
        )
    }
}