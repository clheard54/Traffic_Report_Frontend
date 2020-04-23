export const addCourse = course => {
    return {
        type: 'ADD_COURSE',
        payload: course
    }
}

export const currentCourse = course => {
    return {
        type: "CURRENT_COURSE",
        payload: course
    }
}