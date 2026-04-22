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
  gamification_stats: GamificationStats;
  latest_learning_activity: LatestLearningActivity;
  recent_achievements: Achievement[];
  global_top_leaderboard: LeaderboardEntry[];
}

export interface GamificationStats {
  day_streak: number;
  xp: number;
  level: number;
  current_level_xp: number;
  xp_to_next_level: number;
  progress_percent: number;
}

export interface LatestLearningActivity {
  course: string;
  unit: string;
  lesson_index: number;
  total_lessons: number;
  updated_at: string; // ISO Date string
}

export interface Achievement {
  name: string;
  image: string;
  earned_at: string; // ISO Date string
}

export interface LeaderboardEntry {
  user: UserProfile;
  total_points: number;
}

export interface UserProfile {
  id: number;
  name: string;
  avatar: string;
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
