const INITIAL_STATE = {
    current_user: {},
    current_course: {}
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
                current_course_id: action.payload
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
            loading: false,
            courses: action.payload,
        };
        default:
            return state
    }
}