import React from 'react'
import LoaderHOC_ from './HOCs/LoaderHOC'

class CurrentCourseReport extends React.Component{
    render(){
        return(
            <div style={{'height': '100px'}}>
                <h1>Current Course is loaded</h1>
            </div>
        )
    }
}

export default LoaderHOC_(CurrentCourseReport)