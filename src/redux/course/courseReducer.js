const INITIAL_STATE = {
    current_course: {},
    user_courses: null,
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
            data: [...state.data, action.payload],
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
        };
        default:
            return state
    }
}

export default courseReducer