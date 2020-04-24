const INITIAL_STATE = {
    current_user: null,
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
        case 'FETCH_USER_FAILURE':
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