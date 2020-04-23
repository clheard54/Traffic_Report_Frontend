export * from "./student/studentActions";
export * from "./teacher/teacherActions";
export * from "./response/responseActions";
export * from "./course/courseActions"

/* Ultimately, the state should know:
    - Who is logged in (current_user)
    - Whether that user is a teacher or a student
    - What course they are looking at (current_course)
    - If student, also knows courses_student_id (current_enrollment?)

    state={
        current_user: {
            user: {some student},
            admin: false
        },
        current_course: id number,
        ((nothing else???))
    }

*/