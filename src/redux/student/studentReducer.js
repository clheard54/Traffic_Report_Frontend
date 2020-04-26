
const INITIAL_STATE = {
  current_user: {},
  current_course: {}
}

const studentReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'ADD_STUDENT':
        return {
          ...state,
          students: [...state.students, action.payload],
        };
      case 'SET_STUDENT_USER':
          return {
              ...state,
              current_user: action.payload,
              error: null
          }
      default:
        return state;
    }
  };
  
  export default studentReducer