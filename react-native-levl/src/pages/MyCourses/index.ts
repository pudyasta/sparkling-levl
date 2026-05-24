export interface MyCourse {
  id: number;
  slug: string;
  title: string;
  thumbnail: string;
  progress: {
    percentage: number;
    completed_items: number;
    total_items: number;
  };
}

export interface MyCourseResponse {
  success: boolean;
  message: string;
  data: MyCourse[];
  meta: null | any;
  errors: null | any;
}
