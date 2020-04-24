const INITIAL_STATE = {
  current_user: {},
  current_course: {}
}

  const teacherReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
      case 'ADD_TEACHER':
        return {
          ...state,
          teachers: [...state.teachers, action.payload],
        };
        case 'SET_TEACHER_USER':
          return {
              ...state,
              current_user: action.payload,
              error: null
          }
      default:
        return state;
    }
  };
  
  export default teacherReducer