export interface GamificationSummaryResponse {
  success: boolean;
  message: string;
  data: GamificationData;
  meta: any | null;
  errors: any | null;
  gamification: GamificationShort;
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
}

export interface GamificationShort {
  current_xp: number;
  current_level: number;
}

// Badge related types
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
  type: BadgeType;
  awarded_at: string; // ISO 8601 Date String
}

export type BadgeType =
  | 'habit'
  | 'speed'
  | 'quality'
  | 'completion'
  | 'milestone';

export interface BadgeMeta {
  pagination: Pagination;
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_next: boolean;
  has_prev: boolean;
}
