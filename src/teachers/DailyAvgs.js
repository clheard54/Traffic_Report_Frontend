import React, { Fragment } from 'react'
import WeekAvgs from '../data_charts/WeekAvgs'
import { connect } from 'react-redux'
import LoaderHOC_ from '../HOCs/LoaderHOC'
import { currentCourse } from '../redux'
import { api } from '../services/api'

class DailyAvgs extends React.Component{
  state = {
    max: '',
    min: ''
  }

  
  goBack = () => {
    localStorage.setItem('course_token', this.props.current_course.id)
    this.props.setCurrentCourse(this.props.current_course);
    this.props.history.push('/current_course')
  }

  render(){
    return (
      <Fragment>
      <div className="row flex-row-1">
        <div className='col-md-1'></div>
          <div className ="col-md-8 week-avgs">
          {this.props.current_course !== undefined ?
              <WeekAvgs loaded={!!this.props.current_course.id}/> : null}
              <br></br><br></br>
              </div>
          <div className='col-md-2'>
          <div className='container' style={{'display': 'flex', 'flexDirection': 'column'}}>
              <div className='avg-box'>
                <h5>Week's High:</h5>
                <h6>{this.state.max}</h6>
              </div>
              <br></br><br></br>
              <div className='avg-box'>
                <h5>Week's Low:</h5>
                <h6>{this.state.min}</h6>
              </div>
          </div>  
        </div>
      </div>
      <div className="row flex-row">
        <a style={{'marginTop': '50px'}} className='btn btn-outline-warning btn-lg' onClick={() => this.setCourse(this.props.current_course)} href="/courses/current">Go Back</a>
      </div>
      </Fragment>
    )
  }
}

const mapStateToProps = state => {
  return {
    current_course: state.courses.current_course
  }
} 

const mapDispatchToProps = dispatch => {
  return {
      setCurrentCourse: course => dispatch(currentCourse(course))
  }
}

export default LoaderHOC_(connect(mapStateToProps, mapDispatchToProps)(DailyAvgs))