import React, { Fragment } from 'react'
import { api } from '../services/api'
import TodaysData from '../data_charts/TodaysData'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import TriageChart from '../data_charts/TriageChart'
import WeekAvgs from '../data_charts/WeekAvgs'
import WeekTotal from '../data_charts/WeekTotal'
import { connect } from 'react-redux'
import WeeksData from '../highcharts/WeeksData'
import * as moment from 'moment'

const hash = {
  'red': 2,
  'yellow': 6,
  'green': 10
}
let weekData = []
let numerical 
class TeacherClass extends React.Component{
    constructor(){
      super();
      this.state = {
        avgStyle: null,
        avg: ''
      }
    }

    componentDidUpdate(prevProps){
      if (prevProps.current_course !== this.props.current_course){
        (this.computeAverage())
      }
    }

    componentDidMount(){
      const startDate = moment().clone().subtract(1, 'week')
      const endDate = moment().clone()
      if (this.props.current_course == null) {
        try {
            const current_course = localStorage.getItem('course_token');
            if ('course_token' == null) {
              return undefined;
            }
            api.getRequests.getCourses().then(data => {
                let thisCourse = data.find(parseInt('course_token'));
                this.props.setCurrentCourse(thisCourse)
            })
          } catch (err) {
            this.props.history.push("/profile");
          }
    } 
    
      weekData = this.props.current_course.responses.filter(response => response.datatype == 'light').filter(response => (moment(parseInt(response.day)) >= moment(startDate)) && (moment(parseInt(response.day)) <= moment(endDate)))
      this.computeAverage()
    }

    computeAverage = () => {
      if (weekData.length !==0 ){
      numerical = weekData.map(entry => {
        return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
      })
      let avg = (numerical.reduce((a,b)=>a+b)/weekData.length).toFixed(1)
      this.setState({
        avg: avg,
        avgStyle: {
              'position': 'relative',
              'zIndex': '1',
              'top': 400 - (avg*40).toString() + "px",
              'width': '75px',
              'borderBottom': "5px solid black"
            }
      })
    }
    }
    
    goBack = () => {
      this.props.history.push('/profile')
    }

    render(){
        return (
          <div>
            <h3>{this.props.current_course.title}</h3>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%', 'minHeight': '530px'}}>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-4" >
                      {/* <div style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                        {this.props.current_course ?
                      <ClassAssignmentsContainer/> : null} </div>
                        <br></br>
                        <br></br>
                         */}
                        <div style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}><TriageChart {...this.props} /></div>
                        <br></br>
                        <button className="btn btn-secondary" style={{'maxWidth': '120px', 'margin': 'auto'}} onClick={this.goBack}>Go Back</button>
                    </div>
                    <div className='col-md-6'>
                      <TodaysData />
                    </div>
                    <div className='col-sm-.5'></div>
                  </div>  

                  <br></br>
                  <br></br>
                  <br></br>
                  <hr></hr>
                  <br></br>
                  <br></br>
                  <br></br>

                  <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-8" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                        <WeekTotal />
                        </div>
                    <div className='col-md-1'>
                    <div className='container' style={{'alignItems': 'center', 'paddingLeft':'0px'}}>
                        <div id="gradient">
                          <div className='circle' style={this.state.avgStyle}></div>
                        </div>
                    </div>  
                  </div>
                  <div className='col-md-2'>
                    <div style={{'border': '1px solid black', 'padding': '7px'}}>
                        <h5>Average Feels: </h5>
                        <h4>{this.state.avg}</h4>
                        </div>
                        <br></br>
                        <br></br>
                    </div>
                </div>
                <br></br>
                <br></br>
                <br></br>
                <br></br>

                <hr></hr>
                <div className="row" style={{'display': 'flex','flexDirection': 'column', 'justifyContent': 'center', 'marginTop': '90px'}}>
                <div><br></br></div>
                <div><br></br></div>
                <div className="row">
                    <div className='col-md-2'></div>
                    <div className='col-md-8'>
                    <WeeksData />
                    </div>
                    <div className='col-md-2'></div>

                </div>
                </div>

                <hr></hr>
                <br></br>
                <br></br>
                <br></br>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-md-1'></div>
                    <div className ="col-md-8" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                    {/* {this.props.current_course !== undefined ?
                        <WeekAvgs /> : null} */}
                        </div>
                    <div className='col-md-1'>
                    {/* <div className='container' style={{'alignItems': 'center'}}>
                        <div id="gradient">
                          <div className='circle' style={this.state.avgStyle}></div>
                        </div>
                    </div>  
                    <div className='col-sm-.5'></div> */}
                  </div>
                </div>
              </div>
            </Fragment>
          </div>

        )
    }
}

const mapStateToProps = state => {
    return {
        teachers_responses: state.responses.teachers_responses,
        current_course: state.courses.current_course,
    }
}


export default connect(mapStateToProps)(TeacherClass)