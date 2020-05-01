import React, { Fragment } from 'react'
import { api } from '../services/api'
import { currentCourse } from '../redux'
import TodaysData from '../data_charts/TodaysData'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import TriageChart from '../data_charts/TriageChart'
import WeekAvgs from '../data_charts/WeekAvgs'
import WeekTotal from '../data_charts/WeekTotal'
import { connect } from 'react-redux'
// import WeeksData from '../highcharts/WeeksData'
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
        startDate: moment().clone().subtract(1, 'week'),
        endDate: moment().clone()
      }
    }

    componentDidUpdate(prevProps){
      if (prevProps.current_course !== this.props.current_course){
        (this.computeAverage(this.props.current_course))
      }
    }

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
                'position': 'relative',
                'zIndex': '1',
                'top': 400 - (avg*40).toString() + "px",
                'width': '75px',
                'borderBottom': "5px solid black"
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
                    <div className ="col-md-8" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center'}}>
                        <WeekTotal changeDates={this.changeDates}/>
                        <br></br>
                        <br></br>
                        </div>
                    <div className='col-md-1'>
                    {this.state.loading ? null :
                    <div className='container' style={{'alignItems': 'center', 'paddingLeft':'0px'}}>
                        <div id="gradient">
                          <div className='circle' style={this.state.avgStyle}></div>
                        </div>
                    </div> }
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
                <br></br>
                <br></br>
                <br></br>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-md-1'></div>
                    <div className ="col-md-8" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center'}}>
                    {this.props.current_course !== undefined ?
                        <WeekAvgs /> : null}
                        <br></br>
                        <br></br>
                        </div>
                    <div className='col-md-1'>
                    <div className='container' style={{'alignItems': 'center', 'paddingLeft':'0px'}}>
                        <div id="gradient" style={{'height': '575px'}}>
                          
                        </div>
                    </div>  
                  </div>
                  <div className='col-md-1'>
                        <br></br>
                        <br></br>
                    </div>
                </div>
                <br></br>
                <br></br>
                <br></br>
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


export default connect(mapStateToProps, mapDispatchToProps)(TeacherClass)