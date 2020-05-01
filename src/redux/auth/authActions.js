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
      localStorage.removeItem('current_course')
      return dispatch => {
          dispatch(setStudentUser({}))
      }
  }

  export const setStudent = student => {
    return {
        type: 'SET_STUDENT_USER',
        payload: {...student, admin: false}
    }
}

  export const setTeacher = teacher => {
    return {
        type: 'SET_TEACHER_USER',
        payload: {...teacher, admin: true}
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
                  dispatch(setTeacherUser(resp.user), ()=> {
                  dispatch(setTeacher(resp.user))})
                } else {
                    dispatch(setStudentUser(resp.user), () => {
                    dispatch(setStudent(resp.user))});
                  }
            }
        })
    }
}

// export const setUserAssignments = (user) => {
//   return dispatch => {
//     dispatch(fetchAssignmentsRequest());
//     api.getRequests.getAssignments().then(resp => {
//         if (resp.error){
//             dispatch(fetchAssignmentsFailure(resp.error))
//         } else {
//           if (resp.length > 0){
//             let userHW = []
//             resp.forEach(hw => {
//                 if (user.courses.assignments.includes(hw)) {
//                     userHW.push(hw)}
//             });
//           dispatch(fetchAssignmentsSuccess(userHW));
//           } else {
//             dispatch(fetchAssignmentsSuccess(["No Assignments"]))
//               }
//         }
//     })
// }
// }
