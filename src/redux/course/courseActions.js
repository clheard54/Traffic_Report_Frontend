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
    error: error,
  };
};

export const fetchCoursesRequest = () => {
  return {
    type: 'FETCH_COURSES_REQUEST',
  };
};

export const postCourseSuccess = (newCourse) => {
  return {
    type: 'POST_COURSE',
    payload: newCourse,
  };
};


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
