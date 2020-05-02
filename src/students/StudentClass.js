import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'
import ClassAssignmentsContainer from '../components/ClassAssignmentsContainer'
import IndividualData from '../data_charts/IndividualData'
import TrafficForm from '../components/TrafficForm'
import QuestionBoard from '../containers/QuestionBoard'
import AuthHOC from '../HOCs/AuthHOC'

let student_responses = []
let numerical
class StudentClass extends React.Component{
  state = {
		avg: 0
  }
  
  componentDidMount(){
    if (this.props.current_course == null) {
      try {
          const current_course = localStorage.getItem('course_token');
          if ('course_token' == null) {
            return undefined;
          }
          api.getRequests.getCourses().then(data => {
              let thisCourse = data.find(parseInt(current_course));
              this.props.setCurrentCourse(thisCourse)
          })
        } catch (err) {
          this.props.history.push("/profile");
        }
  } 
    api.getRequests.findCoursesStudent()
      .then(data => {
        let x = data.find(entry => entry['student_id']==this.props.current_user.id && entry['course_id']==this.props.current_course.id)
        this.setState({
          course_student: x
        })
      });
		student_responses = this.props.current_course.responses.map(resp => resp.student_id == this.props.current_user.id ? resp : null).filter(e => e!==null)
		this.computeAverage()
	}

	componentDidUpdate(prevProps){
		if (prevProps.current_course !== this.props.current_course){
			this.computeAverage()
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
  
  
  // constructor(){
  //   super();
  //   this.state = {
  //     course_student: {},
  //     avgStyle: null,
  //     avg: ''
  //   }
  // }

  // storeAvg = (avg) => {
  //   const styling = {
  //     'position': 'relative',
  //     'zIndex': '1',
  //     'top': 400 - (avg*40).toString() + "px",
  //     'left': '24px'
  //   }
  //   this.setState({
  //     avg: avg,
  //     avgStyle: styling
  //   })
  // }

  //As soon as current_course is set (ie, student clicks on a course to go to that page, need to load responses for that course)
  // componentDidMount(){
  //   api.getRequests.findCoursesStudent()
  //     .then(data => {
  //       let x = data.find(entry => entry['student_id']==this.props.current_user.id && entry['course_id']==this.props.current_course.id)
  //       this.setState({
  //         course_student: x
  //       }, () => this.props.getStudentResponses(this.state.course_student)
  //       )
  //     })
  // }
  

  // componentDidUpdate(prevProps){
  //   console.log('mounting')

  //   if (prevProps.current_user !== this.props.current_user || prevProps.current_course !== this.props.current_course){
  //     api.getRequests.findCoursesStudent()
  //     .then(data => {
  //       let x = data.find(entry => entry['student_id']==this.props.current_user.id && entry['course_id']==this.props.current_course.id)
  //       this.setState({
  //         course_student: x
  //       }, () => this.props.getStudentResponses(this.state.course_student)
  //     )
  //     })
  //   }
  // }

    render(){
        return (
          <div>
            <div>
            <h3>{this.props.current_course.title}</h3>
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%', 'minHeight': '530px'}}>
                <div className="row" style={{'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-sm-.5'></div>
                    <div className ="col-md-4" style={{'display': 'flex', 'flexDirection': 'column', 'justifyContent': 'center', 'maxWidth': '30%', 'margin': '18px'}}>
                        <ClassAssignmentsContainer/>
                        <br></br>
                        <button className="btn btn-secondary" style={{'maxWidth': '120px', 'margin': 'auto'}} onClick={this.goBack}>Go Back</button>
                    </div>
                    <div className='col-md-8' style={{'maxWidth': '55%', 'margin': '18px'}}>
                      <TrafficForm course_student={this.state.course_student}/>
                    </div>  
                    <div className='col-sm-.5'></div>
                  </div>
                </div>
                <img style={{'backgroundColor': 'white', 'opacity': '0.8', 'width': '80%', 'height': '140px'}} src='https://wisedriving.s3.amazonaws.com/1557481400.96992aba487fcea3053ff9c455f2f905.png' alt='driving'></img>
            </Fragment>
            <hr></hr>
            <br></br>
            <br></br>
                <br></br>
                <h5>Check out your recent traffic data in this course.</h5><br></br>
                <div className="container">
                <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'alignItems': 'center'}}>
                    <div className='col-md-8'>
                    {this.props.current_course.id ?
                      <IndividualData /> : null}
                    </div> 
                    <div className='col-md-2'>
                        <div className='container' style={{'alignItems': 'center'}}>
                        <div id="gradient">
                          <div  style={this.state.avgStyle}></div>
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
              <br></br>
                <br></br>
                <br></br>
                <hr></hr>
                <br></br>
                <QuestionBoard/>
                
            </div>
          </div>
        )
    }
}

const mapStateToProps = state => {
	return {
		current_user: state.students.current_user,
    current_course: state.courses.current_course
		// student_responses: state.responses.student_responses
	}
}


export default AuthHOC(connect(mapStateToProps)(StudentClass))