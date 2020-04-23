export const addTeacher = teacher => {
    return {
        type: 'ADD_TEACHER',
        payload: teacher
    }
}

export const setTeacherUser = teacher => {
    return {
        type: 'SET_TEACHER_USER',
        payload: {current_user: teacher, admin: true}
    }
}