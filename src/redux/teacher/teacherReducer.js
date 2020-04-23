const initialState = {
    teachers: []
    //teacher = {name, username, password}
  };
  
  const teacherReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_TEACHER':
        return {
          ...state,
          teachers: [...state.teachers, action.payload],
        };
        case 'SET_TEACHER_USER':
          return {
              ...state,
              current_user: action.payload
          }
      default:
        return state;
    }
  };
  
  export default teacherReducer