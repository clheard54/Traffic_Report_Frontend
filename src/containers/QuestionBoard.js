import React, {Fragment} from 'react'

class QuestionBoard extends React.Component{
    constructor(){
        super();
        this.state = {
            questions: []
        }
    }

    handleSubmit = (event) => {
        event.preventDefault()
        newQuestion = {
			text: event.target.text.id,
			course_id: '' //PULL FROM STATE!
		}
		// api.posts.postQuestion(newQuestion)
    }

    showForm = () => {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>Have your own question? Enter it below.</label>
                <input type="textarea" name='text'></input>
                <br></br>
                <input type="submit" value='submit'></input>
            </form>
        )
    }

    renderQuestions = () => {
      if (this.state.questions.length == 0){
        return <h3>No questions have been asked yet.</h3>
      } else {
        let i=1
        return this.state.questions.map(event => {
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
        <div className="question-board">
        <br></br>
            <h2>All Questions:</h2>
            {this.renderQuestions()}
            {this.showForm()}
        </div>
        );
        }

    };

    export default AuthHOC(UserEvent);