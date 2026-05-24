import { GET_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

const COURSES_ENDPOINT = '/courses?include=category,units';

export interface CourseFilters {
  search?: string;
  'filter[level_tag]'?: string;
  'filter[category_id]'?: number;
  sort?: string;
}

export const useCourseRepository = () => {
  const { api } = useApiClient();

  return {
    getCoursesApi: (page: number = 1, filters: CourseFilters = {}) => {
      const params = new URLSearchParams();
      params.set('include', 'category,units');
      params.set('page', String(page));
      if (filters.search) params.set('search', filters.search);
      if (filters['filter[level_tag]']) params.set('filter[level_tag]', filters['filter[level_tag]']!);
      if (filters['filter[category_id]']) params.set('filter[category_id]', String(filters['filter[category_id]']));
      if (filters.sort) params.set('sort', filters.sort);
      return api(`/courses?${params.toString()}`, { method: GET_METHOD }).then((r: any) => r?.data);
    },
  };
};
