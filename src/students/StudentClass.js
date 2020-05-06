import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import { currentCourse } from '../redux'
import IndividualData from '../data_charts/IndividualData'
import TrafficForm from '../components/TrafficForm'
import QuestionBoard from '../containers/QuestionBoard'
import AuthHOC from '../HOCs/AuthHOC'
import LoaderHOC_ from '../HOCs/LoaderHOC'


let student_responses = []
let numerical
class StudentClass extends React.Component{
  state = {
    avg: 0,
    cpqs: []
  }
  
  componentDidMount(){
    this.showCPQs(this.props.current_course)
    this.getCoursesStudentID()
		student_responses = this.props.current_course.responses.map(resp => resp.student_id == this.props.current_user.id ? resp : null).filter(e => e!==null)
		this.computeAverage()
  }
  
  getCoursesStudentID = () => {
    api.getRequests.findCoursesStudent()
    .then(data => {
      let x = data.find(entry => entry['student_id']==this.props.current_user.id && entry['course_id']==this.props.current_course.id)
      this.setState({
        course_student: x
      })
    });
  }

	componentDidUpdate(prevProps){
		if (prevProps.current_course !== this.props.current_course){
      this.computeAverage()
      this.getCoursesStudentID()
		}
	}

	computeAverage = () => {
    if (student_responses.length !==0 ){
		numerical = student_responses.filter(response => response.datatype == 'light').map(entry => {
			return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
    })
    let average = numerical.reduce((a,b)=>a+b)/student_responses.length
    let avg = average.toFixed(1)
		this.setState({
      avg: avg,
      avgStyle: {
            'top': 400 - (avg*40).toString() + "px",
          }
    })
  }
  }

  showCPQs = (course) => {
    api.getRequests.getCPQs().then(data => {
      this.setState({
        cpqs: data.filter(q => q.course_id == course.id)
    })
  })
}

  listCPQs = () => {
    if (this.state.cpqs.length !== 0){
      let todays = this.state.cpqs.filter(question => question.day == new Date().toISOString().slice(0,10))
    for (let i=0; i<todays.length; i++){
      return <li style={{'margin': 'auto'}}>{todays[i].question}</li>
    }
  }
  }

  goBack = () => {
    this.props.history.push('/profile')
  }
  

    render(){
        return (
          <div>
            <div>
            <h3>{this.props.current_course.title}</h3>
            <hr style={{'maxWidth': '30%'}}></hr>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%', 'minHeight': '530px'}}>
                <div className="row flex-row">
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-4" id="class-assigns">
                    <br></br>
                        <ClassAssignmentsContainer/>
                        <br></br>
                        <br></br>
                        <div className='borderBox'>
                      <h5 style={{'overflowWrap': 'normal' }}>Class Participation Questions:</h5>
                        <div><ul style={{'textAlign': 'left'}}>{this.listCPQs(this.props.current_course)}</ul></div>
                        <br></br>
                </div>
                <br></br>
                        <button className="btn btn-secondary" style={{'maxWidth': '120px', 'margin': 'auto'}} onClick={this.goBack}>Go Back</button>
                    </div>
                    <div className='col-md-8' style={{'maxWidth': '55%', 'margin': '28px 20px'}}>
                      <TrafficForm course_student={this.state.course_student}/>
                    </div>  
                    <div className='col-sm-.5'></div>
                  </div>
                  <br></br><br></br><br></br>
                </div>
                
            </Fragment>
            <span style={{'position': 'relative', 'left': '40%'}}>Stats below...</span>
            <hr></hr>
            <br></br>
            <br></br>
                <br></br>
                <h5>Check out your recent traffic data in this course.</h5><br></br><br></br>
                <div className="container">
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center'}}>
                    <div className='col-md-8'>
                      <IndividualData />
                    </div> 
                    <div className='col-md-2'>
                        <div className='container' style={{'alignItems': 'center'}}>
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
              </div>
              <br></br><br></br><br></br><br></br>
                <hr></hr>
              <br></br>
                <QuestionBoard/>
            </div>
            <br></br><br></br><br></br>
            <img style={{'backgroundColor': 'white', 'opacity': '0.8', 'width': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
          </div>
        )
    }
}

const mapStateToProps = state => {
	return {
		current_user: state.students.current_user,
    current_course: state.courses.current_course
	}
}

const mapDispatchToProps = dispatch => {
  return {
    setCurrentCourse: course => dispatch(currentCourse(course))
  }
}


export default LoaderHOC_(AuthHOC(connect(mapStateToProps, mapDispatchToProps)(StudentClass)));