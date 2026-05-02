export interface Category {
  id: number;
  name: string;
  value: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  scope: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Element {
  id: number;
  type: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  sequence: string;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  is_completed: boolean;
  is_locked: boolean;
  xp_reward: number;
}

export interface UnitProgress {
  percentage: number;
  completed_items: number;
  total_items: number;
  status: 'not_started' | 'in_progress' | 'completed';
  is_locked: boolean;
}

export interface Unit {
  id: number;
  course_slug: string;
  course_name: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
  progress: UnitProgress;
  elements: Element[];
}

export interface LastAccessedItem {
  id: number;
  title: string;
  slug: string;
}

export interface OverallProgress {
  percentage: number;
  completed_items: number;
  total_items: number;
  last_accessed_lesson: LastAccessedItem;
  last_accessed_unit: LastAccessedItem;
}

export interface CourseData {
  id: number;
  code: string;
  slug: string;
  title: string;
  short_desc: string;
  type: string;
  type_label: string;
  level_tag: 'pemula' | 'menengah' | 'mahir';
  level_tag_label: string;
  enrollment_type: string;
  enrollment_type_label: string;
  status: 'published' | 'draft';
  status_label: string;
  enrollment_status: 'active' | 'pending' | 'completed' | 'cancelled';
  enrollment_status_label: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  thumbnail: string;
  banner: string;
  category: Category;
  tags: Tag[];
  units: Unit[];
  progress: OverallProgress;
}

export interface CoursePagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  from: number;
  to: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  data: CourseData[];
  meta: { pagination: CoursePagination };
  errors: any | null;
}

export interface CourseQueryParams {
  search?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  'filter[status]'?: string;
  'filter[level_tag]'?: string;
  'filter[type]'?: string;
  'filter[category_id]'?: number;
  include?: string;
}
