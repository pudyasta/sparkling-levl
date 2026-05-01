export interface CourseProgress {
  percentage: number;
  completed_items: number;
  total_items: number;
  last_accessed_lesson: LastAccessedItem | null;
  last_accessed_unit: LastAccessedItem | null;
}

export interface LastAccessedItem {
  id: number;
  title: string;
  slug: string;
}

export interface MyCourse {
  id: number;
  code: string;
  slug: string;
  title: string;
  short_desc: string;
  type: string;
  type_label: string;
  level_tag: string;
  level_tag_label: string;
  enrollment_type: string;
  enrollment_type_label: string;
  status: string;
  status_label: string;
  enrollment_status: string;
  enrollment_status_label: string;
  published_at: string; // ISO Date string
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  thumbnail: string;
  banner: string;
  progress: CourseProgress;
}

export interface MyCourseResponse {
  data: MyCourse[];
}
