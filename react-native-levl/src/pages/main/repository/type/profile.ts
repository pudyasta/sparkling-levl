export interface GamificationSummaryResponse {
  success: boolean;
  message: string;
  data: GamificationData;
  meta: any | null;
  errors: any | null;
}

export interface GamificationData {
  xp: XPStats;
  level: LevelInfo;
  badges: BadgeStats;
  leaderboard: LeaderboardRank;
  activity: ActivityStats;
}

export interface XPStats {
  total: number;
  today: number;
  this_week: number;
  this_month: number;
  period: number;
}

export interface LevelInfo {
  current: number;
  name: string;
  progress_percentage: number;
  xp_to_next_level: number;
}

export interface BadgeStats {
  total_earned: number;
  period_earned: number;
}

export interface LeaderboardRank {
  global_rank: number;
  total_students: number;
}

export interface ActivityStats {
  current_streak: number;
  longest_streak: number;
  total_course_enrolled: number;
}

export interface BadgeResponse {
  success: boolean;
  message: string;
  data: Badge[];
  meta: BadgeMeta;
  errors: any | null;
}

export interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  icon_url: string;
  type: 'habit' | 'speed' | 'quality' | 'completion' | 'milestone';
  awarded_at: string;
}

export interface BadgeMeta {
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
  meta: any | null;
  errors: any | null;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
}
