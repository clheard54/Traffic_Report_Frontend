import { createStore } from 'redux';
import { combineReducers } from 'redux'
import studentReducer from './student/studentReducer';
import teacherReducer from './student/studentReducer';
import responseReducer from './student/studentReducer';
import courseReducer from './student/studentReducer';

export const rootReducer = combineReducers({
    students: studentReducer,
    teachers: teacherReducer,
    responses: responseReducer,
    courses: courseReducer
})

const store = createStore(rootReducer);

export default store;
