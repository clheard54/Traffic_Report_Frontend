import React, { Fragment } from 'react'
import WeekAvgs from '../data_charts/WeekAvgs'
import { connect } from 'react-redux'
import LoaderHOC_ from '../HOCs/LoaderHOC'
import { currentCourse } from '../redux'
import * as moment from 'moment'
import { api } from '../services/api'

class DailyAvgs extends React.Component{
  state = {
    max: '',
    min: '',
    startDate: moment().clone().subtract(1, 'week'),
    endDate: moment().clone()
  }

  changeDates = (newStart, newEnd) => {
    this.setState({
      startDate: newStart,
      endDate: newEnd
    })
  }

  listFeedback = () => {
    return this.props.current_course.responses
    .filter(response => moment(parseInt(response.day)) >= moment(this.state.startDate))
    .filter(response => moment(parseInt(response.day)) <= moment(this.state.endDate))
    .map(resp => {
        if (!!resp.feedback){
          return <>&emsp;<li key={resp.id}>{resp.feedback}</li></>
        } else {
          return null
        }
      })
    }

  render(){
    return (
      <Fragment>
      <br></br>
      <h3>{this.props.current_course.title}</h3>
      <hr style={{'maxWidth': '30%'}}></hr>
      <br></br><br></br>
      <WeekAvgs changeDates={this.changeDates}/>
      
      <div className='flex-row'>
        <div className='col-md-9 feedback'>
          <h5>Recent Feedback:</h5>
            <ul className='three-columns'>{this.listFeedback()}</ul>
          {/* <a style={{'maxWidth': '60%', 'alignSelf': 'center', 'fontSize': '18px', 'color': 'white'}} className='btn btn-warning' onClick={() => this.setCourse(this.props.current_course)} href="/courses/current">Go Back</a> */}
          </div>
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