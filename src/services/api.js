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

const getAssignments = () => {
  // then filter questions by course...
  return fetch(`${API_ROOT}/assignments`, {
    headers: headers()
  }).then(res => res.json())
}

const createTeacher = data => {
  return fetch(`${API_ROOT}/admin_signup`, {
    method: "POST",
    headers: {      
      "Content-Type": "application/json",
      Accept: "application/json"
      },
    body: JSON.stringify({teacher: data})
  }).then(res => res.json())
};

const createStudent = data => {
  return fetch(`${API_ROOT}/student_signup`, {
    method: "POST",
    headers: {      
      "Content-Type": "application/json",
      Accept: "application/json"
      },
    body: JSON.stringify({student: data})
  }).then(res => res.json())
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

const postCpq = (newCpq) => {
  return fetch(`${API_ROOT}/cpqs`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newCpq)
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

const getQuestions = () => {
  return fetch(`${API_ROOT}/questions`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const getCPQs = () => {
  return fetch(`${API_ROOT}/cpqs`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const getTeachersResponses = () => {
  return fetch(`${API_ROOT}/responses`, {
    headers: headers()
  })
  .then(resp => resp.json())
  }

const deleteQuestion = (id) => {
  return fetch(`${API_ROOT}/questions/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  .then(resp => resp.json())
}

const getCourses = () => {
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

const addStudentClass = (newClass) => {
  return fetch(`${API_ROOT}/courses_students`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newClass)
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
    getAssignments,
    getCourses,
    findCoursesStudent,
    getTeachersResponses,
    getQuestions,
    getCPQs
  },
  posts: {
    postResponse,
    postQuestion,
    postAssignment,
    deleteQuestion,
    postCpq,
    addStudentClass
  }
};