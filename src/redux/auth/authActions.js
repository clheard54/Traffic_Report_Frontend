import { api } from '../../services/api'
import {setStudentUser, setTeacherUser, fetchCourses } from '../index'

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
                    dispatch(setTeacherUser(resp.user))
                } else {
                    dispatch(setStudentUser(resp.user))
                }
                dispatch(fetchCourses(resp.user))
            }
        })
    }
}

  