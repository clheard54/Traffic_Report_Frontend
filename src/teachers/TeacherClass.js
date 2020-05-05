import React, { Fragment } from 'react'
import TodaysData from '../data_charts/TodaysData'
import AuthHOC from '../HOCs/AuthHOC'
import TriageChart from '../data_charts/TriageChart'
import WeekAvgs from '../data_charts/WeekAvgs'
import WeekTotal from '../data_charts/WeekTotal'
import QuestionBoard from '../containers/QuestionBoard'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import AddCPForm from './AddCPQForm'
import AddAssignmentForm from './AddAssignmentForm'
import { api } from '../services/api'
import { currentCourse } from '../redux'
import { connect } from 'react-redux'
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
        avg: '',
        loading: true,
        addingAssignment: false,
        seeQuestions: false,
        startDate: moment().clone().subtract(1, 'week'),
        endDate: moment().clone()
      }
    }

    // componentDidUpdate(prevProps){
    //   if (prevProps.current_course !== this.props.current_course){
    //     (this.computeAverage(this.props.current_course))
    //   }
    // }

    componentDidMount(){
        if (!this.props.current_course.id) {
            try {
                const current_course = localStorage.getItem('course_token');
                if ('course_token' == null) {
                  return undefined;
                }
                api.getRequests.getCourses().then(data => {
                    let thisCourse = data.filter(course => course.id == parseInt(current_course));
                    this.props.setCurrentCourse(thisCourse[0])
                    this.setState({
                      loading: false
                    }, () => this.computeAverage(thisCourse[0]))
                })
              } catch (err) {
                this.props.history.push("/profile");
              }
        }
        this.computeAverage(this.props.current_course)
    }

    computeAverage = (course) => {
      if (!!course.id){
        weekData = course.responses.filter(response => response.datatype == 'light').filter(response => (moment(parseInt(response.day)) >= moment(this.state.startDate)) && (moment(parseInt(response.day)) <= moment(this.state.endDate)))
        
        if (weekData.length !==0 ){
        numerical = weekData.map(entry => {
          return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
        })
        let avg = (numerical.reduce((a,b)=>a+b)/weekData.length).toFixed(1)
        this.setState({
          avg: avg,
          avgStyle: {
                'top': 500 - (avg*50).toString() + "px",
              }
          })
        }
      }
    }

    changeDates = (newStart, newEnd) => {
      this.setState({
        startDate: newStart,
        endDate: newEnd
      })
    }
    
    goBack = () => {
      this.props.history.push('/profile')
    }

    addingAssignment = () => {
      this.setState({
        addingAssignment: true,
        seeQuestions: false
      })
    }

    seeQuestionBoard = () => {
      this.setState({
        seeQuestions: true,
        addingAssignment: false
      })
    }

    hwPosted = () => {
      this.setState({
        addingAssignment: false
      })
    }

    resetPage = () => {
      this.setState({
        addingAssignment: false,
        seeQuestions: false
      })
    }

    render(){
        return (
          <div>
            <h3>{this.props.current_course.title}</h3>
            <hr style={{'maxWidth': '30%'}}></hr>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%', 'minHeight': '530px'}}>
                <div className="row flex-row-1">
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-4" >
                      <button className='btn btn-outline-success' onClick={this.addingAssignment}><h6>View / Add Assignments</h6></button>
                      &emsp;
                      <button className='btn btn-outline-warning' onClick={this.seeQuestionBoard}><h6>See Question Board</h6></button>
                        <br></br><br></br>
                        {this.state.addingAssignment ?
                        <Fragment>
                          <h4>Current List:</h4>
                          <ClassAssignmentsContainer/>
                          <br></br>
                          <button className="btn btn-outline-danger" onClick={this.resetPage}>Just Kidding, Go Back</button>
                        </Fragment>
                        : (this.state.seeQuestions ? 
                        <div className='user-hw'>
                          <AddCPForm/>
                          <button className="btn btn-outline-danger" onClick={this.resetPage}>Just Kidding, Go Back</button>
                        </div>
                        : 
                        <Fragment>
                          <div id='triage'>
                            <TriageChart {...this.props} />
                          </div>
                        <br></br>
                        <button className="btn btn-outline-danger goBack"  onClick={this.goBack}><h6>Go Back</h6></button>
                        </Fragment> )}
                    </div>
                    <div className='col-md-6' id='addHw'>
                    {this.state.addingAssignment ?
                    <AddAssignmentForm hwAdded={this.hwPosted}/>
                     : (this.state.seeQuestions ? 
                     <QuestionBoard />
                     : <TodaysData />) }
                      <br></br>
                    </div>
                    <div className='col-sm-.5'></div>
                  </div>  

                <br></br><br></br><br></br>
                  <hr ></hr>
                  <br></br><br></br>

                  <div className="row flex-row-1">
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-8 week-totals">
                        {/* <WeekTotal changeDates={this.changeDates}/> */}
                        <br></br><br></br>
                        </div>
                    <div className='col-md-1'>
                    {/* {this.state.loading ? null : */}
                    <div className='container' style={{'alignItems': 'center', 'paddingLeft':'0px'}}>
                        <div id="gradient" style={{'height': '500'}}>
                          <div className='circle' style={this.state.avgStyle}></div>
                        </div>
                    </div> 
                  </div>
                  <div className='col-md-2'>
                    <div className='avg-box'>
                        <h5>Average Feels: </h5>
                        <h4>{this.state.avg}</h4>
                        </div>
                        <br></br><br></br>
                    </div>
                </div>
                <br></br><br></br><br></br><br></br>
                <hr></hr>
                <br></br><br></br><br></br>

                <div className="row flex-row-1">
                    <div className='col-md-1'></div>
                    <div className ="col-md-8 week-avgs">
                    {/* {this.props.current_course !== undefined ?
                        <WeekAvgs /> : null} */}
                        <br></br><br></br>
                        </div>
                    <div className='col-md-2'>
                    {/* <div className='container' style={{'display': 'flex', 'flexDirection': 'column'}}>
                        <div className='avg-box'>
                          <h5>Week's High:</h5>
                          <h6>{this.state.max}</h6>
                        </div>
                        <br></br><br></br>
                        <div className='avg-box'>
                          <h5>Week's Low:</h5>
                          <h6>{this.state.min}</h6>
                        </div>
                    </div>   */}
                  </div>
                </div>
                <br></br><br></br><br></br>
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

const mapDispatchToProps = dispatch => {
  return {
    setCurrentCourse: course => dispatch(currentCourse(course))
  }
}


export default AuthHOC(connect(mapStateToProps, mapDispatchToProps)(TeacherClass))