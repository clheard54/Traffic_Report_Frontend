import React, { Fragment } from 'react'
import { api } from '../services/api'
import TodaysData from '../data_charts/TodaysData'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import TriageChart from '../data_charts/TriageChart'
import WeekAvgs from '../data_charts/WeekAvgs'
import WeekTotal from '../data_charts/WeekTotal'
import { connect } from 'react-redux'
import { loadClassResponses } from '../redux'


const hash = {
  'red': 2,
  'yellow': 6,
  'green': 10
}


class TeacherClass extends React.Component{
    constructor(){
      super();
      this.state = {
        classResponses: [],
        avgStyle: null,
        avg: ''
      }
    }
  
    storeAvg = (avg) => {
      const styling = {
        'position': 'relative',
        'zIndex': '1',
        'top': 400 - (avg*40).toString() + "px",
        'left': '24px'
      }
      this.setState({
        avg: avg,
        avgStyle: styling
      })
    }

    componentDidMount(){
      this.props.loadClassResponses(this.props.current_course)
    }

    componentDidUpdate(prevProps){
      if (prevProps.teachers_responses !== this.props.teachers_responses){
        this.storeAvg(this.computeAverage())
      }
      if (prevProps.current_course !== this.props.current_course){
          this.props.loadClassResponses(this.props.current_course.id)
          }
    }

  computeAverage = () => {
    let numerical = this.props.class_responses.map(entry => {
      return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
    })
    return numerical.reduce((a,b)=>a+b)/this.props.class_responses.length
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
                      <div style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                        {this.props.current_course ?
                      <ClassAssignmentsContainer/> : null} </div>
                        <br></br>
                        <br></br>
                        
                        <div style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}><TriageChart /></div>
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
                    <div className='col-md-3'>
                    <div className='container' style={{'alignItems': 'center'}}>
                        <div id="gradient">
                          <div className='circle' style={this.state.avgStyle}></div>
                        </div>
                    </div>  
                    <div className='col-sm-.5'></div>
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
                    <div className ="col-md-8" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                    {this.props.current_course !== undefined ?
                        <WeekAvgs /> : null}
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

const mapDispatchToProps = dispatch => {
  return {
    loadClassResponses: id => loadClassResponses(id)(dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TeacherClass)