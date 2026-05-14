export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon_url: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Unit {
  id: number;
  title: string;
  slug: string;
  order: number;
  total_lessons: number;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | string;
  estimated_duration: number | null;
  total_units: number;
  is_enrolled: boolean;
  category: Category | null;
  units: Unit[];
  tags: Tag[];
}

export interface CoursePagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface CoursesResponse {
  data: Course[];
  meta: CoursePagination;
}

export interface MyCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  progress_percentage: number;
  enrolled_at: string;
  completed_at: string | null;
  category: Category | null;
}
