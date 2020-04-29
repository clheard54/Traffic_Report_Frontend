const API_ROOT = `http://localhost:3000/api/v1`;

const token = () => localStorage.getItem("token");

const headers = () => {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: token()
  };
};

const login = data => {
  return fetch(`${API_ROOT}/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data)
  }).then(res => res.json());
};

const getCurrentUser = () => {
  return fetch(`${API_ROOT}/current_user`, {
    headers: headers()
  }).then(res => {
    return res.json();
  });
};

const getAssignments = (/*CURRENT COURSE?*/) => {
  // then filter questions by course...
  return fetch(`${API_ROOT}/assignments`, {
    headers: headers()
  }).then(res => {
    return res.json();
  });
}

const createTeacher = data => {
  return fetch(`${API_ROOT}/admin_signup`, {
    method: "POST",
    headers: {      
      "Content-Type": "application/json",
      Accept: "application/json"
      },
    body: JSON.stringify({user: data})
  }).then(res => res.json());
};

const createStudent = data => {
  return fetch(`${API_ROOT}/student_signup`, {
    method: "POST",
    headers: {      
      "Content-Type": "application/json",
      Accept: "application/json"
      },
    body: JSON.stringify({user: data})
  }).then(res => res.json());
};

const postResponse = (newResponse) => {
  return fetch(`${API_ROOT}/responses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newResponse)
  })
  .then(resp => resp.json())
}

const postQuestion = (newQuestion) => {
  return fetch(`${API_ROOT}/questions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newQuestion)
  })
  .then(resp => resp.json())
}

const postAssignment = (newHW) => {
  return fetch(`${API_ROOT}/assignments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newHW)
  })
  .then(resp => resp.json())
}

const getResponses = () => {
  return fetch(`${API_ROOT}/responses`, {
    headers: headers()
  })
  .then(resp => resp.json())
    // probably sort based on course of interest
}

const getTeachersResponses = () => {
  return fetch(`${API_ROOT}/responses`, {
    headers: headers()
  })
  .then(resp => resp.json())
  }

const getClassResponses = (course) => {
  return fetch(`${API_ROOT}/responses`, {
    headers: headers()
  })
  .then(resp => resp.json())
  .then(data => {
    return data.filter(response => course.responses ? course.responses.includes(response) : null)
  })
}

const getStudents = (course) => {
  return fetch(`${API_ROOT}/students`)
  .then(resp => resp.json())
    // probably sort based on course of interest
}

const getCourses = (user) => {
  return fetch(`${API_ROOT}/courses`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const findCoursesStudent = () => {
  return fetch(`${API_ROOT}/courses_students`, {
    headers: headers()
  })
  .then(resp => resp.json())
}


export const api = {
  auth: {
    login,
    getCurrentUser,
    createTeacher,
    createStudent
  },
  getRequests: {
    getResponses,
    getStudents,
    getClassResponses,
    getAssignments,
    getCourses,
    findCoursesStudent,
    getTeachersResponses
  },
  posts: {
    postResponse,
    postQuestion,
    postAssignment
  }
};