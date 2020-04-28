import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import AssignmentsContainer from '../components/AssignmentsContainer'
import IndividualData from '../data_charts/IndividualData'
import TrafficForm from '../components/TrafficForm'
import { loadStudentResponses } from '../redux'
import QuestionBoard from '../containers/QuestionBoard'

class StudentClass extends React.Component{
  constructor(){
    super();
    this.state = {
      course_student: {},
      avgStyle: null
    }
  }

  storeAvg = (avg) => {
    const styling = {
      'position': 'relative',
      'zIndex': '1',
      'top':'25px',
      'left': (avg*20).toString() + "px"
    }
    this.setState({
      avgStyle: styling
    })
  }

  componentDidUpdate(prevProps){
    if (prevProps.current_user !== this.props.current_user || prevProps.current_course !== this.props.current_course){
      api.getRequests.findCoursesStudent()
      .then(data => {
        let x = data.find(entry => entry['student_id']==this.props.current_user.id && entry['course_id']==this.props.current_course.id)
        this.setState({
          course_student: x
        })
      })
    }
  }

    render(){
        return (
          <div>
            <div>
            <h3>{this.props.current_course.title}</h3>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%', 'minHeight': '530px'}}>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-3" style={{'borderStyle': 'solid', 'borderWidth': '2px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center', 'height': 'fit-content'}}>
                        <AssignmentsContainer/>
                    </div>
                    <div className='col-md-8'>
                      <TrafficForm course_student={this.state.course_student}/>
                    </div>  
                    <div className='col-sm-.5'></div>
                  </div>
                </div>
                <img style={{'backgroundColor': 'white', 'opacity': '0.8', 'width': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
            </Fragment>
            <hr></hr>
            <br></br>
            
                <QuestionBoard/>
                <br></br>
                <br></br>
                <hr></hr>
                <br></br>
                <br></br>
                <div className="container">
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between'}}>
                    <div className ="col-md-3">
                    <br></br>
                        <h5>Check out your recent traffic data in this course.</h5>
                        <br></br>
                        <p>Average Feels: </p>
                        <div className='container'>
                        <div id="gradient">
                          <div className='circle' style={this.state.avgStyle}></div>
                        </div>
                        </div>
                    </div>
                    <div className='col-sm-.5'></div>
                    <div className='col-md-8'>
                      <IndividualData course_student={this.state.course_student} getAverage={this.storeAvg}/> 
                    </div>  
                  </div>
                </div>
            </div>
          </div>
        )
    }
}

const mapStateToProps = state => {
	return {
		current_user: state.students.current_user,
		current_course: state.courses.current_course,
		student_responses: state.responses.student_responses
	}
}

const mapDispatchToProps = dispatch => {
	return {
		getStudentResponses: (id) => loadStudentResponses(id)(dispatch)	
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(StudentClass)