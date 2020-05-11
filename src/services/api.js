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
  return fetch(`/api/v1/login`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data)
  }).then(res => res.json());
};

const getCurrentUser = () => {
  return fetch(`/api/v1/current_user`, {
    headers: headers()
  }).then(res => {
    return res.json();
  });
};

const getAssignments = () => {
  // then filter questions by course...
  return fetch(`/api/v1/assignments`, {
    headers: headers()
  }).then(res => res.json())
}

const createTeacher = data => {
  return fetch(`/api/v1/admin_signup`, {
    method: "POST",
    headers: {      
      "Content-Type": "application/json",
      Accept: "application/json"
      },
    body: JSON.stringify({teacher: data})
  }).then(res => res.json())
};

const createStudent = data => {
  return fetch(`/api/v1/student_signup`, {
    method: "POST",
    headers: {      
      "Content-Type": "application/json",
      Accept: "application/json"
      },
    body: JSON.stringify({student: data})
  }).then(res => res.json())
};

const postResponse = (newResponse) => {
  return fetch(`/api/v1/responses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newResponse)
  })
  .then(resp => resp.json())
}

const postQuestion = (newQuestion) => {
  return fetch(`/api/v1/questions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newQuestion)
  })
  .then(resp => resp.json())
}

const postCpq = (newCpq) => {
  return fetch(`/api/v1/cpqs`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newCpq)
  })
  .then(resp => resp.json())
}

const postAssignment = (newHW) => {
  return fetch(`/api/v1/assignments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newHW)
  })
  .then(resp => resp.json())
}

const getResponses = () => {
  return fetch(`/api/v1/responses`, {
    headers: headers()
  })
  .then(resp => resp.json())
    // probably sort based on course of interest
}

const getQuestions = () => {
  return fetch(`/api/v1/questions`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const getCPQs = () => {
  return fetch(`/api/v1/cpqs`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const getTeachersResponses = () => {
  return fetch(`/api/v1/responses`, {
    headers: headers()
  })
  .then(resp => resp.json())
  }

const deleteQuestion = (id) => {
  return fetch(`/api/v1/questions/${id}`, {
    method: 'DELETE',
    headers: headers()
  })
  .then(resp => resp.json())
}

const getCourses = () => {
  return fetch(`/api/v1/courses`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const findCoursesStudent = () => {
  return fetch(`/api/v1/courses_students`, {
    headers: headers()
  })
  .then(resp => resp.json())
}

const addStudentClass = (newClass) => {
  return fetch(`/api/v1/courses_students`, {
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