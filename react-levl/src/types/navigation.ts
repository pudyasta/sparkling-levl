export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailConfirmation: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  CourseDetail: { courseId: number; slug: string };
  Lessons: {
    lesson_slug: string;
    unit_slug: string;
    course_slug: string;
    assignment_id: number;
    type: string;
    all_lessons: any[];
  };
  Quiz: { quizId: number };
  QuizResult: {
    submission_id: number;
    quiz_id: number;
    score: number;
    final_score: number;
    is_passed: boolean;
    time_spent: number;
  };
  MyCourses: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Leaderboard: undefined;
  Profile: undefined;
};
