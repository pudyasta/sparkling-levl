import type { Category, Unit, UnitProgress } from '@/pages/CourseDetail/repository/type';

export interface GetAllCoursesRequest {
  search?: string;
  sort?: string;
  perPage?: number;
  page?: number;
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: CourseData[];
  meta: Meta;
  errors: any | null;
}

export interface CourseData {
  id: number;
  code: string;
  slug: string;
  title: string;
  short_desc: string;
  type: 'kluster' | 'okupasi';
  level_tag: 'dasar' | 'menengah' | 'mahir';
  enrollment_type: 'approval' | 'auto_accept' | 'key_based';
  status: 'published' | 'draft';
  enrollment_status: string | null;
  published_at: string; // ISO 8601 date string
  created_at: string;
  updated_at: string;
  thumbnail: string;
  banner: string;
  category: Category;
  tags: Tags[];
  units: Unit[];
  progress: UnitProgress;
}

export interface Meta {
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

export interface Tags {
  id: number;
  name: string;
  slug: string;
}
