import React, {Fragment} from 'react'
import LoaderHOC_ from '../HOCs/LoaderHOC'
import { api } from '../services/api'
import { connect } from 'react-redux'

class QuestionBoard extends React.Component{
  constructor(){
    super();
    this.state = {
      questions: [],
      show: false,
      newQ: ''
    }
  }

  componentDidMount(){
    this.setState({
      questions: this.props.current_course.questions
    })
  }

  handleAsk = () => {
    this.setState(prev => {
      return {
        show: !prev.show
      }
    })
  }

  handleChange = (event) => {
    this.setState({
      newQ: event.target.value
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    let newQuestion = {
      question: {
        text: this.state.newQ,
        course_id: this.props.current_course.id
        }
      }
    api.posts.postQuestion(newQuestion).then(data => {
      this.setState(prev => {
        return {
          questions: [...prev.questions, data],
          show: !prev.show
        }
      })
    })
}
  
  showForm = () => {
      return (
          <form onSubmit={this.handleSubmit}>
          <br></br>
              <label>Watcha wanna know?</label>
              <input type="textarea" rows='3' onChange={this.handleChange} name='text' value={this.state.newQ}></input>
              <br></br><br></br>
              <input className='btn btn-outline-primary' type="submit" value='Submit'></input>
          </form>
      )
  }

  deleteQuestion = (id) => {
    api.posts.deleteQuestion(id).then(data => {
      this.setState({
        questions: this.props.current_course.questions
      })
    })
  }

    renderQuestions = () => {
      if (this.state.questions.length == 0){
        return (
        <div style={{'minHeight': '275px'}}>
          <h6>No questions have been asked yet.</h6>
          <br></br>
          <br></br>
        </div> )
      } else {
        let i=1
        return this.state.questions.map(question => {
          return (
            <Fragment>
              <div className='flex-row' key={question.id}>
                <div className='col-md-8'><p>{i}. {question.text}</p></div>
                <div className='col-md-2'>
                {this.props.current_user.admin ? 
                  <span style={{'alignSelf': 'right'}}><button className='btn btn-outline-danger btn-sm' onClick={() => this.deleteQuestion(question.id)}>Delete</button></span>
                :null}</div>
                <span style={{display:'none'}}>{i++}</span>
                </div>
                <br></br>
            </Fragment>
          )
        })
      }
    }

    render(){
      return (
        <div className="container" style={{'maxWidth': '95%'}}>
          <div className="row flex-row" id="question-border"> 
          {!this.props.current_user.admin ?
            <Fragment>
              <div className='col-md-8' id="question-border">
              <h2>All Questions:</h2>
              <br></br>
              {this.renderQuestions()}
            </div>  
            <div className='col-md-3'>
              <br></br>
              <h5>Do YOU have a question about something?</h5>
              <button style={{'padding': '10px'}} className="btn btn-primary font-weight-bolder" onClick={this.handleAsk}>Ask It!</button>
              {this.state.show == true ? this.showForm() : null}
            </div> 
            <br></br>  
            <div className='col-sm-.5'></div>
            </Fragment>
             : 
             <div >
              <h2>All Questions:</h2>
              <br></br>
              {this.renderQuestions()}
            </div>  }
        </div>
        </div>
        );
        }

    };

    const mapStateToProps = state => {
      return {
        current_course: state.courses.current_course,
        current_user: state.auths.current_user
      }
    }

    export default LoaderHOC_(connect(mapStateToProps)(QuestionBoard))
  ;