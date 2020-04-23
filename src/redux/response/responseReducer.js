const initialState = {
    responses: [],
    //response = {answer: 'green', datatype: 'color', courses_student_id: 3}
  };
  
  const responseReducer = (state = initialState, action) => {
    switch (action.type) {
      case ADD_RESPONSE:
        return {
          ...state,
          responses: [...state.responses, action.payload],
        };
      default:
        return state;
    }
  };
  
  export default responseReducer