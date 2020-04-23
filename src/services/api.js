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
    body: JSON.stringify( {auth: data})
  }).then(res => res.json());
};

const getCurrentUser = () => {
  return fetch(`${API_ROOT}/current_user`, {
    headers: headers()
  }).then(res => {
    return res.json();
  });
};

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
  fetch(`${API_ROOT}/responses`, {
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
  fetch(`${API_ROOT}/questions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(newQuestion)
  })
  .then(resp => resp.json())
  .then(data => 
    console.log(data))
}

const getResponses = (course) => {
  fetch(`${API_ROOT}/responses`)
  .then(resp => resp.json())
  .then(data => 
    // probably sort based on course of interest
    console.log(data))
}

const getStudents = (course) => {
  fetch(`${API_ROOT}/students`)
  .then(resp => resp.json())
  .then(data => 
    // probably sort based on course of interest
    console.log(data))
}


export const api = {
  auth: {
    login,
    getCurrentUser,
    createUser
  },
  getRequests: {
    getResponses,
    getStudents
  },
  posts: {
    postResponse,
    postQuestion
  }
};