const INITIAL_STATE = {
  current_user: {},
  current_course: {},
  loading: false
}

const responseReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'ADD_RESPONSE':
        return {
          ...state,
          responses: [...state.responses, action.payload],
        };
      case 'POST_RESPONSE':
        return {
          ...state,
          loading: false,
          data: [...state.data, action.payload],
        };
      case 'FETCH_RESPONSES_REQUEST':
        return {
          ...state,
          loading: true,
        };
      case 'FETCH_RESPONSES_SUCCESS':
        return {
          ...state,
          loading: false,
          responses: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default responseReducer


