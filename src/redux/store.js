import { createStore, applyMiddleware } from 'redux';
import { combineReducers } from 'redux'
import logger from 'redux-logger';
import studentReducer from './student/studentReducer';
import teacherReducer from './teacher/teacherReducer';
import responseReducer from './response/responseReducer';
import courseReducer from './course/courseReducer';
import authReducer from './auth/authReducer'

export const rootReducer = combineReducers({
    auths: authReducer,
    students: studentReducer,
    teachers: teacherReducer,
    responses: responseReducer,
    courses: courseReducer,
})

export const store = createStore(rootReducer, applyMiddleware(logger));

export default store;
