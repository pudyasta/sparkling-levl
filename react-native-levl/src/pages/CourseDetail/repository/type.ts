export interface CourseDetailResponse {
  success: boolean;
  message: string;
  data: CourseDetailData;
  meta: null | any;
  errors: null | any;
}

export interface CourseDetailData {
  id: number;
  slug: string;
  title: string;
  short_desc: string;
  level_tag: string;
  enrollment_type: string;
  enrollment_status: 'active' | 'pending' | 'completed' | 'cancelled' | null;
  thumbnail: string;
  banner: string;
  category: { id: number; name: string; value: string };
  tags: { id: number; name: string; slug: string }[];
  units: CourseUnit[];
  progress: OverallProgress;
}

export interface CourseUnit {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  progress: UnitProgress;
  elements: LessonElement[];
}

export interface UnitProgress {
  percentage: number;
  completed_items: number;
  total_items: number;
  status: 'not_started' | 'in_progress' | 'completed';
  is_locked: boolean;
}

export interface OverallProgress {
  percentage: number;
  completed_items: number;
  total_items: number;
  last_accessed_lesson: { id: number; title: string; slug: string } | null;
  last_accessed_unit: { id: number; title: string; slug: string } | null;
}

export interface LessonElement {
  id: number;
  type: string;
  title: string;
  slug: string;
  order: number;
  is_completed: boolean;
  is_locked: boolean;
  xp_reward: number;
}

export interface EnrollResponse {
  success: boolean;
  message: string;
  data: { status: string };
  meta: null;
  errors: null | any;
}
