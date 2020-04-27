import React, {Fragment} from 'react'
import { api } from '../services/api'

class QuestionBoard extends React.Component{
  constructor(){
    super();
    this.state = {
      questions: [],
      show: false
    }
  }

  handleAsk = () => {
    this.setState(prev => {
      return {
        show: !prev.show
      }
    })
  }

  handleSubmit = (event) => {
    event.preventDefault()
    let newQuestion = {
      text: event.target.text.id,
      courses_student: this.props.current_course
      }
    api.posts.postQuestion(newQuestion).then(data => {
      console.log(data)
    })
    this.setState(prev => {
      return {
        show: !prev.show
      }
    })
}
  
  showForm = () => {
      return (
          <form onSubmit={this.handleSubmit}>
          <br></br>
              <label>Watcha wanna know?</label>
              <input type="textarea" rows='3' name='text'></input>
              <br></br><br></br>
              <input className='btn btn-outline-primary' type="submit" value='Submit'></input>
          </form>
      )
  }

    renderQuestions = () => {
      if (this.state.questions.length == 0){
        return (
        <div style={{'minHeight': '275px'}}>
          <br></br>
          <h6>No questions have been asked yet.</h6>
          <br></br>
          <br></br>
        </div> )
      } else {
        let i=1
        return this.state.questions.map(question => {
          return (
            <Fragment>
              <div>
                <p>{i}. {question.text}</p>
                <span style={{display:'none'}}>{i++}</span>
                <br></br>
                </div>
            </Fragment>
          )
        })
      }
    }

    render(){
      return (
        <div className="container" style={{'maxWidth': '100%'}}>
          <div className="row" style={{'display': 'flex', 'justifyContent': 'space-between', 'width': '100%',  'marginLeft': '0', 'marginRight': '0'}}>
            <div className='col-sm-.5'></div>
            <div className ="col-md-8" style={{'borderStyle': 'solid', 'borderWidth': '1px', 'borderColor': 'var(--gray-dark)', 'padding': '15px', 'alignText': 'center'}}>
            <h2>All Questions:</h2>
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
        </div>
        </div>
        );
        }

    };

    export default QuestionBoard;