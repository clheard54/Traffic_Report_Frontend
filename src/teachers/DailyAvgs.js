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
      <br></br>
      <WeekAvgs loaded={!!this.props.current_course.id}/>
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