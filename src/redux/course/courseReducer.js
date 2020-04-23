
const courseReducer = (state = {}, action) => {
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
        default:
            return state
    }
}