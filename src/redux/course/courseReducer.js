const INITIAL_STATE = {
    current_course: {assignments: [], responses: [], students:[]},
    user_courses: [],
    classResponses: [],
    classHW: [],
    classQs: [],
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
        case 'FETCH_ASSIGNMENTS_REQUEST':
        return {
            ...state,
            loading: true,
        };
        case 'FETCH_ASSIGNMENTS_SUCCESS':
        return {
            ...state,
            classHW: [...action.payload],
            loading: false,
            error: null
        };
        case 'FETCH_ASSIGNMENTS_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        case 'FETCH_RESPONSES_REQUEST':
        return {
            ...state,
            loading: true,
        };
        case 'FETCH_RESPONSES_SUCCESS':
        return {
            ...state,
            classResponses: [...action.payload],
            loading: false,
            error: null
        };
        case 'FETCH_RESPONSES_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        case 'FETCH_QUESTIONS_REQUEST':
        return {
            ...state,
            loading: true,
        };
        case 'FETCH_QUESTIONS_SUCCESS':
        return {
            ...state,
            classQs: [...action.payload],
            loading: false,
            error: null
        };
        case 'FETCH_QUESTIONS_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload
        };
        default:
            return state
    }
}

export default courseReducer