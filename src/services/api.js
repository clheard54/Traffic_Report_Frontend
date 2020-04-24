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
  return fetch(`${API_ROOT}/questions`, {
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
  // let newResponse = {
  //   [event.target.name]: event.target.value
  // }
  return fetch(`${API_ROOT}/responses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newResponse)
  })
  .then(resp => resp.json())
  .then(data => 
    console.log(data))
}

const postQuestion = (newQuestion) => {
  // let newQuestion = {
  //   [event.target.name]: event.target.value
  // }
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

const getResponses = (course) => {
  return fetch(`${API_ROOT}/responses`)
  .then(resp => resp.json())
    // probably sort based on course of interest
}

const getStudents = (course) => {
  return fetch(`${API_ROOT}/students`)
  .then(resp => resp.json())
    // probably sort based on course of interest
}

const getCourses = (user) => {
  return fetch(`${API_ROOT}/courses`)
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
    getAssignments,
    getCourses
  },
  posts: {
    postResponse,
    postQuestion,
    postAssignment
  }
};