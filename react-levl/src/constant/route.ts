export const AUTH_LOGIN_ENDPOINT = '/auth/login';
export const AUTH_REGISTER_ENDPOINT = '/auth/register';
export const AUTH_REFRESH_ENDPOINT = '/auth/refresh';
export const AUTH_VERIFY_EMAIL_ENDPOINT = '/auth/email/verify';
export const AUTH_RESEND_VERIFY_EMAIL_ENDPOINT = '/auth/email/verify/send';
export const AUTH_FORGOT_PASSWORD_ENDPOINT = '/auth/forgot-password';

export const DASHBOARD_SUMMARY_ENDPOINT = '/dashboard';
export const DASHBOARD_RECENT_LEARNING_ENDPOINT = '/dashboard/recent-learning';
export const DASHBOARD_RECOMMENDED_COURSES_ENDPOINT = '/dashboard/recommended-courses';
export const DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT = '/dashboard/recent-achievements';

export const COURSE_DETAIL_ENDPOINT = '/courses/SLUG?include=units,category,elements,tags';
export const LESSON_DETAIL_ENDPOINT = '/courses/COURSE_SLUG/units/UNIT_SLUG/lessons/LESSON_SLUG';
export const LESSON_MARK_AS_DONE_ENDPOINT = 'lessons/LESSON_SLUG/complete';

export const ASSIGNMENT_DETAIL_ENDPOINT = '/assignments/ASSIGNMENT_ID';
export const SUBMIT_ASSIGNMENT_DETAIL_ENDPOINT = '/assignments/ASSIGNMENT_ID/submissions';

export const QUIZ_DETAIL_ENDPOINT = '/quizzes/QUIZ_ID';
export const QUIZ_SUBMISSION_START_ENDPOINT = '/quizzes/QUIZ_ID/submissions/start';

export const MY_COURSE_ENDPOINT = '/my-courses?search=';
