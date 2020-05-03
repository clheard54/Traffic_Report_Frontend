import React, {Fragment} from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux'

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

  deleteQuestion = (id) => {
    api.posts.deleteQuestion(id).then(data => {
      console.log(data)
    })
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
              <div key={question.id}>
                <p>{i}. {question.text}</p>
                {this.current_user.admin ? 
                <button className='btn btn-warning' onClick={() => this.deleteQuestion(question.id)}>&emsp; &emsp; Delete</button>
                :null}
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
          <div className="row flex-row">   
              <div className ="col-md-8" id="question-border">
              <h2>All Questions:</h2>
              {this.renderQuestions()}
            </div>  

            {!this.props.current_user.admin ?
            <Fragment>
            <div className='col-md-3'>
              <br></br>
              <h5>Do YOU have a question about something?</h5>
              <button style={{'padding': '10px'}} className="btn btn-primary font-weight-bolder" onClick={this.handleAsk}>Ask It!</button>
              {this.state.show == true ? this.showForm() : null}
            </div> 
            <br></br>  
            <div className='col-sm-.5'></div>
            </Fragment> : null }
        </div>
        </div>
        );
        }

    };

    const mapStateToProps = state => {
      return {
        current_user: state.auths.current_user
      }
    }

    export default connect(mapStateToProps)(QuestionBoard)
  ;