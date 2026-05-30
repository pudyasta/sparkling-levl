export interface LeaderboardResponse {
  success: boolean;
  message: string;
  data: LeaderboardEntry[];
  meta: LeaderboardMeta;
  errors: any | null;
}

export interface User {
  id: number;
  name: string;
  avatar_url: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  total_xp: number;
  level: number;
  badges_count: number;
}

export interface LeaderboardMeta {
  pagination: Pagination;
  my_rank: LeaderboardEntry;
}

export interface UserRankData {
  rank: number;
  total_xp: number;
  level: number;
  badges_count: number;
  surrounding: RankEntry[];
}

export interface RankEntry {
  rank: number;
  user: User;
  total_xp: number;
  level: number;
  badges_count: number;
  is_current_user?: boolean;
}

export interface UserRank {
  rank: number;
  total_xp: number;
  level: number;
  badges_count: number;
  surrounding: RankEntry[];
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_next: boolean;
  has_prev: boolean;
}
