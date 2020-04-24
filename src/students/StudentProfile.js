import React, {Fragment} from 'react'
import AssignmentsContainer from '../components/AssignmentsContainer'
import { api } from '../services/api'
import AuthHOC from "../HOCs/AuthHOC";

class StudentProfile extends React.Component{

    render(){
        return (
            <Fragment>
                <br></br>
                <div className="container" style={{'maxWidth': '100%'}}>
                <div className="row" style={{'width': '100%', 'marginLeft': '0', 'marginRight': '0'}}>
                    <div className='col-md-2'></div>
                    <div className='col-md-6' style={{'display': 'flex', 'flexDirection': 'column', 'textAlign':'left'}}>
                        <h4 style={{'color': '#007bff'}}>Your Classes</h4>
                        
                    </div>
                    <div className ="col-md-4" style={{'borderStyle': 'solid', 'borderWidth': '3px', 'borderColor': 'var(--gray-dark)', 'position': 'relative', 'right': '10%', 'padding': '15px'}}>
                        <AssignmentsContainer/>
                    </div>
                </div>
                </div>
            </Fragment>
        )
    }
}

export default AuthHOC(StudentProfile)