import React from 'react'
import { api } from '../services/api'
import { connect } from 'react-redux';

class TriageChart extends React.Component{
    constructor() {
        super();
        this.state ={
            classResponses: []
        }
    }

    componentDidMount(){
            this.setState({
                classResponses: this.props.class_responses,
                ids: this.props.class_responses.map(resp => resp.student_id[0]),
                students: this.props.current_course.students
            })
    }

    componentDidUpdate(prevProps){
        if (prevProps.class_responses !== this.props.class_responses || prevProps.current_course !== this.props.current_course){
            this.componentDidMount()
        }
    }

    noAnswer = (classR) => {
        if (this.state.students != undefined) {
            let missing = this.state.students.filter(student => !this.state.ids.includes(student.id)) 
            return missing.join(' ')
        }
    }

    red = (classR) => {
        if (this.props.class_responses != undefined) {
            let reds = this.state.classResponses.map((k, v) => {
                if (k == 'red'){
                    return v
                }
            })
            return reds.join(' ')
        }
    }


    render(){
        return (
          <div>
          <h5>Triage Chart:</h5>
          {this.props.class_responses !== undefined ?
            <table style={{width:"100%"}}>
                <tr>
                    <th>HAVE NOT ANSWERED: </th>
                    <td>{this.noAnswer(this.state.classResponses)}</td>
                </tr>
                <tr>
                    <th>RED LIGHT: </th>
                    <td>{this.red(this.state.classResponses)}</td>
                </tr>
                <tr>
                    <th>YELLOW:</th>
                    {this.state.classResponses !== undefined ? <td>{this.state.classResponses.map((k, v) => {
                        if (k == 'yellow'){
                            return v
                        }
                    })}</td> : null }
                </tr>
                <tr>
                    <th>GREEN:</th>
                    {this.state.classResponses !== undefined ? <td>{this.state.classResponses.map((k, v) => {
                        if (k == 'green'){
                            return v
                        }
                    })}</td> : null }
                </tr>
            </table> : null }
          </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        current_course: state.courses.current_course,
        class_responses: state.responses.class_responses
    }
}

export default connect(mapStateToProps)(TriageChart)