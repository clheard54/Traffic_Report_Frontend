import React from 'react'
import { connect } from "react-redux"
import { api } from '../services/api'
import { currentCourse } from '../redux'

const LoaderHOC_ = WrappedComponent => {

    class LoaderHOC extends React.Component {
            
                    
        isReady = () => {
            return !!this.props.current_course.id 
        }

        render() {
            return this.isReady()? <WrappedComponent {...this.props} /> : <h3>Loading Data...</h3>
        }
    }

    const mapStateToProps = state => {
        return {
            current_course: state.courses.current_course
        }
    }
    

    return connect(mapStateToProps)(LoaderHOC)
}


export default LoaderHOC_