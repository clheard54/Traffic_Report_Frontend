import { api } from '../../services/api'
import {setStudentUser, setTeacherUser, setUserCourses } from '../index'

//Actions related to setting current_user in store
export const fetchUserSuccess = (user) => {
    return {
      type: 'FETCH_USER_SUCCESS',
      payload: user,
    };
  };
  
  export const fetchUserFailure = (error) => {
    return {
      type: 'FETCH_USER_FAILURE',
      payload: error,
    };
  };
  
  export const fetchUserRequest = () => {
    return {
      type: 'FETCH_USER_REQUEST',
    };
  };

  export const userLogout = () => {
      localStorage.removeItem('token')
      return dispatch => {
          dispatch(setStudentUser({}))
      }
  }

  export const userLogin = (user) => {
      return dispatch => {
        dispatch(fetchUserRequest());
        api.auth.login(user).then(resp => {
            if (resp.error){
                dispatch(fetchUserFailure(resp.error))
            } else {
                localStorage.setItem('token', resp.jwt)
                if (resp.user.admin){
                  dispatch(setTeacherUser(resp.user));
                } else {
                    dispatch(setStudentUser(resp.user));
                  }
            }
        })
    }
}

//Actions related to setting current_course in store
export const selectCourseSuccess = (course) => {
  return {
    type: 'SELECT_COURSE_SUCCESS',
    payload: course,
  };
};

export const selectCourseFailure = (error) => {
  return {
    type: 'SELECT_COURSE_FAILURE',
    payload: error,
  };
};

export const selectCourseRequest = () => {
  return {
    type: 'FETCH_COURSE_REQUEST',
  };
};
