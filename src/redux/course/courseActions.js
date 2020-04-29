import { api } from "../../services/api";

export const addCourse = course => {
    return {
        type: 'ADD_COURSE',
        payload: course
    }
}

export const currentCourse = course => {
    return {
        type: "CURRENT_COURSE",
        payload: course
    }
}


export const fetchCoursesSuccess = (courses) => {
  return {
    type: 'FETCH_COURSES_SUCCESS',
    payload: courses,
  };
};

export const fetchCoursesFailure = (error) => {
  return {
    type: 'FETCH_COURSES_FAILURE',
    payload: error,
  };
};

export const fetchCoursesRequest = () => {
  return {
    type: 'FETCH_COURSES_REQUEST'
  };
};

// export const fetchAssignmentsSuccess = (hw) => {
//   return {
//     type: 'FETCH_ASSIGNMENTS_SUCCESS',
//     payload: hw,
//   };
// };

// export const fetchAssignmentsFailure = (error) => {
//   return {
//     type: 'FETCH_ASSIGNMENTS_FAILURE',
//     payload: error
//   };
// };

// export const fetchAssignmentsRequest = () => {
//   return {
//     type: 'FETCH_ASSIGNMENTS_REQUEST'
//   };
// };

// export const fetchResponsesSuccess = (resp) => {
//   return {
//     type: 'FETCH_RESPONSES_SUCCESS',
//     payload: resp,
//   };
// };

// export const fetchResponsesFailure = (error) => {
//   return {
//     type: 'FETCH_RESPONSES_FAILURE',
//     payload: error
//   };
// };

// export const fetchResponsesRequest = () => {
//   return {
//     type: 'FETCH_RESPONSES_REQUEST'
//   };
// };

// export const fetchQuestionsSuccess = (q) => {
//   return {
//     type: 'FETCH_QUESTIONS_SUCCESS',
//     payload: q,
//   };
// };

// export const fetchQuestionsFailure = (error) => {
//   return {
//     type: 'FETCH_QUESTIONS_FAILURE',
//     payload: error
//   };
// };

// export const fetchQuestionsRequest = () => {
//   return {
//     type: 'FETCH_QUESTIONS_REQUEST'
//   };
// };

export const postCourseSuccess = (newCourse) => {
  return {
    type: 'POST_COURSE',
    payload: newCourse,
  };
};

export const setUserCourses = (user) => {
  return dispatch => {
    dispatch(fetchCoursesRequest());
    api.getRequests.getCourses().then(resp => {
      if (resp.error){
        dispatch(fetchCoursesFailure(resp.error))
      } else {
          if (resp.length > 0){
            let userCourses = []
            if (!!user.admin){
              resp.forEach(course => {
              if (course.teacher_id == user.id){
                userCourses.push(course)}
            })
            } else {
              resp.forEach(course => {
                let students = course.students.map(student => student.id)
                if (students.includes(user.id)) {
                    userCourses.push(course)}
                })
            }
            dispatch(fetchCoursesSuccess(userCourses));
          } else {
            dispatch(fetchCoursesSuccess("-"))
          }
        };
      });
    };
  }

  // export const loadClassAssignments = (course) => {
  //   return dispatch => {
  //     dispatch(fetchAssignmentsRequest());
  //     api.getRequests.getAssignments(course).then(resp => {
  //       if (resp.error){
  //         dispatch(fetchAssignmentsFailure(resp.error))
  //       } else {
  //           if (resp.length > 0){
  //             let classHW = []
  //             resp.forEach(hw => {
  //                 if (course.assignments.includes(hw)) {
  //                     classHW.push(hw)}
  //             });
  //           dispatch(fetchAssignmentsSuccess(classHW));
  //           } else {
  //             dispatch(fetchAssignmentsSuccess("-"))
  //           }
  //         };
  //       });
  //     };
  //   }

    // export const loadClassResponses = (course) => {
    //   console.log('getting class resp')
    //   return dispatch => {
    //     dispatch(fetchResponsesRequest());
    //     api.getRequests.getResponses().then(resp => {
    //       if (resp.error){
    //         dispatch(fetchResponsesFailure(resp.error))
    //       } else {
    //           if (resp.length > 0){
    //             let filtered = resp.filter(response => response.course_id == course.id)
    //           dispatch(fetchResponsesSuccess(filtered));
    //           } else {
    //             dispatch(fetchResponsesSuccess("-"))
    //           }
    //         };
    //       });
    //     };
    //   }

      // export const loadClassQuestions = (course) => {
      //   return dispatch => {
      //     dispatch(fetchQuestionsRequest());
      //     api.getRequests.getQuestions(course).then(resp => {
      //       if (resp.error){
      //         dispatch(fetchQuestionsFailure(resp.error))
      //       } else {
      //           if (resp.length > 0){
      //             let qs = resp.filter(x => course.questions.includes(x))
      //           dispatch(fetchQuestionsSuccess(qs));
      //           } else {
      //             dispatch(fetchQuestionsSuccess("-"))
      //           }
      //         };
      //       });
      //     };
      //   }

  // export const setCurrentCourse = (course) => {
  //   return dispatch => {
  //     dispatch(currentCourse(course))
  //           } 
  //   }

/*
export const fetchCourses = (user) => {
  return (dispatch) => {
    dispatch(fetchCoursesRequest());
    fetch("http://localhost:3000/api/v1/courses")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          dispatch(fetchCoursesFailure(data.error));
        } else {
          let userCourses = []
          if (data.length > 0){
            data.forEach(course => {
                let students = course.students.map(student => student.id)
                if (students.includes(user.id)) {
                    userCourses.push(course)}
            })
          }
          dispatch(fetchCoursesSuccess(userCourses));
        }
      })
  };
};
*/

export const postCourse = (newCourse) => {
  return (dispatch) => {
    dispatch(fetchCoursesRequest());
    fetch("http://localhost:3000/api/v1/courses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          dispatch(fetchCoursesFailure(data.error));
        } else {
          dispatch(postCourseSuccess(data));
        }
      });
  };
};
