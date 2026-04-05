/**
|--------------------------------------------------
| Dashboard Summary type
|--------------------------------------------------
*/
export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
  meta: null | any;
  errors: null | any;
}

export interface DashboardData {
  streak: StreakInfo;
  level: LevelInfo;
  xp: XPInfo;
  courses: CourseStats;
  learning_hours: number;
  days_active: number;
  recent_activity: ActivityItem[];
}

export interface StreakInfo {
  current: number;
  longest: number;
}

export interface LevelInfo {
  current: number;
  name: string;
  current_xp: number;
  required_xp: number;
  next_level_xp: number;
  progress_percentage: number;
}

export interface XPInfo {
  total: number;
  this_month: number;
}

export interface CourseStats {
  enrolled: number;
}

export type ActivityType =
  | 'activity'
  | 'assignment_submission'
  | 'course_completion';

export interface ActivityItem {
  type: ActivityType;
  description: string;
  xp_earned: number;
  timestamp: string; // ISO 8601 format
}

/**
|--------------------------------------------------
| Recent Learning Type
|--------------------------------------------------
*/
export interface RecentLearningResponse {
  success: boolean;
  message: string;
  data: LearningActivity[];
  meta: null | any;
  errors: null | any;
}

export interface LearningActivity {
  course: CourseSummary;
  progress: ProgressStats;
  last_lesson: LastLessonInfo;
  last_accessed_at: string; // ISO 8601
}

export interface CourseSummary {
  id: number;
  title: string;
  slug: string;
  thumbnail: string;
}

export interface ProgressStats {
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
}

export interface LastLessonInfo {
  id: number;
  title: string;
  unit_title: string;
}

/**
|--------------------------------------------------
| Recommended Course
|--------------------------------------------------
*/
export interface RecommendedCoursesResponse {
  success: boolean;
  message: string;
  data: RecommendedCourse[];
  meta: null | any;
  errors: null | any;
}

export interface RecommendedCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail: string;
  instructor: InstructorInfo;
  enrollments_count: number;
}

export interface InstructorInfo {
  id: number;
  name: string;
}
