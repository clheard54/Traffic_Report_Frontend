const INITIAL_STATE = {
  student_responses: [],
  teachers_responses: [],
  responses: [],
  class_responses: [],
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
          student_responses: [...state.student_responses, action.payload],
          responses: [...state.responses, action.payload],
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
      case 'FETCH_RESPONSES_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        // case 'FETCH_STUDENT_RESPONSES_SUCCESS':
        //   return {
        //     ...state,
        //     student_responses: action.payload,
        //     loading: false,
        //   }
        case 'FETCH_TEACHERS_RESPONSES_SUCCESS':
        return {
          ...state,
          teachers_responses: action.payload,
          loading: false,
        };
        // case 'FETCH_CLASS_RESPONSES_SUCCESS':
        // return {
        //   ...state,
        //   class_responses: action.payload,
        //   loading: false,
      default:
        return state;
    }
  };
  
  export default responseReducer


