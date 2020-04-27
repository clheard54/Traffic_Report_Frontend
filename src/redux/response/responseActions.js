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


export const loadResponses = () => {
  return (dispatch) => {
    dispatch(fetchResponsesRequest());
    api.getRequests.getResponses().then(data => {
        if (data.error){
          dispatch(fetchResponsesFailure(data.error))
        } else {
          dispatch(fetchResponsesSuccess(data));
        }
      });
  };
};


export const postResponse = (newResponse) => {
  return (dispatch) => {
    dispatch(fetchResponsesRequest());
    fetch("http://localhost:3000/api/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newResponse),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          dispatch(fetchResponsesFailure(data.error));
        } else {
          dispatch(postResponseSuccess(data));
        }
      });
  };
};
