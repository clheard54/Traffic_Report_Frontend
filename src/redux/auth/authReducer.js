const INITIAL_STATE = {
    current_user: null,
    current_course: {},
    user_courses: [],
    user_assignments: [],
    error: null
}

 const authReducer = (state = INITIAL_STATE, action) => {
    switch (action.type){
        case 'ADD_COURSE':
            return {
                ...state,
                courses: [...state.courses, action.payload]
            };

        case 'FETCH_USER_REQUEST':
        return {
            ...state,
            loading: true,
        };
        
        case 'FETCH_USER_SUCCESS':
        return {
            ...state,
            loading: false,
            error: null
        };
        case 'SET_STUDENT_USER':
          return {
              ...state,
              current_user: action.payload,
              error: null
          }
        case 'SET_TEACHER_USER':
        return {
            ...state,
            current_user: action.payload,
            error: null
        }
        case 'FETCH_USER_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        case 'FETCH_ASSIGNMENTS_REQUEST':
            return {
                ...state,
                loading: true,
            };
        case 'FETCH_ASSIGNMENTS_SUCCESS':
        return {
            ...state,
            loading: false,
            error: null,
            user_assignments: action.payload
        };
        case 'FETCH_ASSIGNMENTS_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        default:
            return state
    }
}


export default authReducer