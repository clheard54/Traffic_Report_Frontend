export const addStudent = student => {
    return {
        type: 'ADD_STUDENT',
        payload: student
    }
}

export const setStudentUser = student => {
    return {
        type: 'SET_STUDENT_USER',
        payload: {...student, admin: false}
    }
}


