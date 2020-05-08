import React, { Fragment } from 'react'
import TodaysData from '../data_charts/TodaysData'
import AuthHOC from '../HOCs/AuthHOC'
import TriageChart from '../data_charts/TriageChart'
import WeekBubble from '../data_charts/WeekBubble'
import WeekTotal from '../data_charts/WeekTotal'
import QuestionBoard from '../containers/QuestionBoard'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import AddCPForm from './AddCPQForm'
import AddAssignmentForm from './AddAssignmentForm'
import LoaderHOC_ from '../HOCs/LoaderHOC'
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
        addingAssignment: false,
        seeQuestions: false,
        startDate: moment().clone().subtract(1, 'week'),
        endDate: moment().clone()
      }
    }

    componentDidMount(){
        this.computeAverage(this.props.current_course)
    }

    computeAverage = (course) => {
      if (!!course.id){
        weekData = course.responses
        .filter(response => (moment(parseInt(response.day)) >= moment(this.state.startDate)) && (moment(parseInt(response.day)) <= moment(this.state.endDate)))
        
        if (weekData.length !==0 ){
        numerical = weekData.map(entry => {
          return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
        })
        let avg = (numerical.reduce((a,b)=>a+b)/weekData.length).toFixed(1)
        this.setState({
          avg: avg,
          avgStyle: {
                'top': 550 - (avg*55).toString() + "px",
              }
          })
        } else {
          this.setState({ avg: 0 })
        }
      }
    }

    troubleList = () => {
      let troubleList=[]
      let manyReds = []
      let weekReds = this.props.current_course.responses
      .filter(response => (moment(parseInt(response.day)) >= moment().clone().subtract(1, 'week') && moment(parseInt(response.day)) <= moment().clone()))
      .filter(resp => resp.answer == 'red')
      .map(resp => resp.student_id)
      let counterObj = weekReds.reduce(function(obj, b) {
        obj[b] = ++obj[b] || 1;
        return obj;
      }, {})
      Object.keys(counterObj).forEach(id => {
        if (counterObj[id] >=3 ){
          troubleList.push(id)
        }
      })
      troubleList.forEach(id => {
        let kid = this.props.current_course.students.find(student => student.id == parseInt(id))
        if (!!kid && !manyReds.includes(kid)){
          manyReds.push(kid.name)
        }
      })
      return <>{manyReds.join(', ')}</>
    }

    changeDates = (newStart, newEnd) => {
      this.setState({
        startDate: newStart,
        endDate: newEnd
      }, () => this.computeAverage(this.props.current_course))
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
                      <button className='aa btn btn-outline-success' onClick={this.addingAssignment}>View / Add Assignments</button>
                      &emsp;
                      <button className='aa btn btn-outline-warning' onClick={this.seeQuestionBoard}>See Question Board</button>
                        <br></br><br></br>
                        {this.state.addingAssignment ?
                        <Fragment>
                          <h4>Current List:</h4>
                          <ClassAssignmentsContainer/>
                          <br></br>
                          <button className="btn btn-outline-danger" onClick={this.resetPage}>Just Kidding, Go Back</button>
                        </Fragment>
                        : (this.state.seeQuestions ? 
                        <div className='borderBox'>
                          <AddCPForm/>
                          <button className="btn btn-outline-danger" onClick={this.resetPage}>Just Kidding, Go Back</button>
                        </div>
                        : 
                        <Fragment>
                          <div id='triage'>
                            <TriageChart {...this.props} />
                          </div>
                        <br></br>
                        <button className="aa btn btn-outline-danger goBack"  onClick={this.goBack}>Go Back</button>
                        </Fragment> )}
                    </div>
                    <div className='col-md-6' id='addHw'>
                    {this.state.addingAssignment ?
                    <AddAssignmentForm hwAdded={this.hwPosted}/>
                     : (this.state.seeQuestions ? 
                     <QuestionBoard/>
                     : <TodaysData />) }
                      <br></br>
                    </div>
                    <div className='col-sm-.5'></div>
                  </div>  

                <br></br><br></br><br></br>
                <hr className='yellow-hr'></hr>
                <br></br><br></br>
                <div className='container' id='div1'>
                <br></br>
                <WeekBubble /><br></br><br></br>
                <div id='div2'></div>
                </div>
                <br></br>
                <div className='flex-row'>
                  <div className='col-md-2'></div>
                  <div className='col-md-6'>
                  <h5><b>Students with 3+ REDS this week:&emsp;</b> {this.troubleList()}</h5>
                  </div>
                  <div className='col-md-4'></div>
                </div>
                <br></br><br></br>
                <hr className='red-hr'></hr>
                <br></br><br></br><br></br>
                  <div className="row flex-row-1">
                    <div className='col-sm-1' style={{'maxWidth': '5%'}}></div>
                    <div className ="col-md-8 week-totals">
                        <WeekTotal changeDates={this.changeDates}/>
                        <br></br><br></br>
                        </div>
                    <div className='col-md-1'>
                    <div className='container' style={{'alignItems': 'center'}}>
                        <div id="gradient" style={{'height': '550'}}>
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
                    <div className='col-sm-1'></div>

                </div>
                <br></br><br></br><br></br>
                <button className='btn btn-outline-danger btn-lg' onClick={() => this.props.history.push('/daily_avgs')}>See Daily Averages</button>
                <br></br><br></br><br></br>
                <hr className='yellow-hr'></hr>
                <br></br><br></br><br></br>
                <br></br><br></br><br></br><br></br>
                <div style={{'display': 'flex'}}>
                    <img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img><img className="cars" src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
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

const mapDispatchToProps = dispatch => {
  return {
    setCurrentCourse: course => dispatch(currentCourse(course))
  }
}

export default LoaderHOC_(connect(mapStateToProps, mapDispatchToProps)(TeacherClass));