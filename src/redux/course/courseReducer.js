const INITIAL_STATE = {
    current_course: {assignments: [], responses: [], students:[]},
    user_courses: [],
    assignments: [],
    questions: [],
    courses: [],
    loading: false
}


const courseReducer = (state = INITIAL_STATE, action) => {
    switch (action.type){
        case 'ADD_COURSE':
            return {
                ...state,
                courses: [...state.courses, action.payload]
            };
        case 'CURRENT_COURSE':
            return {
                ...state,
                current_course: action.payload
            }
        case 'POST_COURSE':
        return {
            ...state,
            loading: false,
            courses: [...state.data, action.payload],
        };
        case 'FETCH_COURSES_REQUEST':
        return {
            ...state,
            loading: true,
        };
        case 'FETCH_COURSES_SUCCESS':
        return {
            ...state,
            user_courses: [...action.payload],
            loading: false,
            error: null
        };
        case 'FETCH_COURSES_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        case 'ADD_ASSIGNMENT':
            return {
                ...state,
                current_course: {...state.current_course, assignments: [...state.current_course.assignments, action.payload]}
            };
        case 'ADD_QUESTION':
        return {
            ...state,
            courses: [...state.courses, action.payload]
        };
        default:
            return state
    }
}

export default courseReducer