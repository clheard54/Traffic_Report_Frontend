import { api } from "../../services/api";

export const addResponse = response => {
    return {
        type: 'ADD_RESPONSE',
        payload: response
    }
}

export const fetchResponsesSuccess = (responses) => {
  return {
    type: 'FETCH_RESPONSES_SUCCESS',
    payload: responses,
  };
};

export const fetchStudentResponsesSuccess = (responses) => {
  return {
    type: 'FETCH_STUDENT_RESPONSES_SUCCESS',
    payload: responses,
  };
};

export const fetchResponsesFailure = (error) => {
  return {
    type: 'FETCH_RESPONSES_FAILURE',
    error: error,
  };
};

export const fetchResponsesRequest = () => {
  return {
    type: 'FETCH_RESPONSES_REQUEST',
  };
};

export const postResponseSuccess = (newResponse) => {
  return {
    type: 'POST_RESPONSE',
    payload: newResponse,
  };
};


export const loadStudentResponses = (id) => {
  return (dispatch) => {
    dispatch(fetchResponsesRequest());
    api.getRequests.getResponses().then(data => {
        if (data.error){
          dispatch(fetchResponsesFailure(data.error))
        } else {
          let filtered = data.filter(entry => entry['courses_student_id']==id)
          dispatch(fetchStudentResponsesSuccess(filtered));
        }
      });
  };
};


export const postResponse = (newResponse) => {
  return (dispatch) => {
    dispatch(fetchResponsesRequest());
    api.posts.postResponse(newResponse).then(resp => {
      if (resp.error) {
          dispatch(fetchResponsesFailure(resp.error));
        } else {
          dispatch(postResponseSuccess(resp));
        }
      });
  };
};
