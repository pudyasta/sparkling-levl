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
  global_top_leaderboard: any[];
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
  updated_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  icon_url: string;
  earned_at: string;
}

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
  last_accessed_at: string;
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

export interface RecommendedCoursesResponse {
  success: boolean;
  message: string;
  data: CourseData[];
  meta: null | any;
  errors: null | any;
}

export interface CourseData {
  id: number;
  title: string;
  slug: string;
  short_desc: string;
  level_tag: string;
  thumbnail: string;
  banner: string;
  category: { id: number; name: string; slug: string } | null;
  units: { id: number; title: string; slug: string }[];
  progress?: { total_items: number; completed_items: number; percentage: number };
}

export interface GamificationSummaryData {
  xp: { total: number; today: number; this_week: number; period: number };
  level: { current: number; name: string; progress_percentage: number; xp_to_next_level: number };
  badges: { total_earned: number };
  leaderboard: { global_rank: number; total_students: number };
  activity: { current_streak: number; longest_streak: number; total_course_enrolled: number };
}
