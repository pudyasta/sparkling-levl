import { useQuery } from '@tanstack/react-query';

import type { ApiResponse } from '@/lib/api/core';

import type {
  AssignmentStudentResponse,
  GetAssginmentRequest,
} from '../repository/type/assignment';
import type { GetLessonsRequest, LessonData } from '../repository/type/lessons';
import type { GetQuizRequest, QuizStudentResponse } from '../repository/type/quiz';
import { useGetLessonsRepo } from '../repository/useGetLessonsRepo';

type unionRequest = GetAssginmentRequest | GetLessonsRequest | GetQuizRequest;

interface QueryOptions<T> {
  request: unionRequest;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export const useGetLessons = <TData = LessonData | AssignmentStudentResponse | QuizStudentResponse>(
  request: unionRequest,
  options?: Omit<QueryOptions<ApiResponse<TData>>, 'queryKey' | 'queryFn'>
) => {
  const { getLessons, getAssignment, getQuiz } = useGetLessonsRepo();

  return useQuery({
    queryKey: ['lessons', request],
    queryFn: async (): Promise<ApiResponse<TData>> => {
      let response;

      if (request.type === 'assignment') {
        response = await getAssignment({
          type: request.type,
          assignment_id: request.assignment_id,
        });
      } else if (request.type === 'quiz') {
        response = await getQuiz({
          type: request.type,
          quiz_id: request.quiz_id,
        });
      } else if (request.type === 'lesson') {
        response = await getLessons({
          type: request.type,
          course_slug: request.course_slug,
          unit_slug: request.unit_slug,
          lesson_slug: request.lesson_slug,
        });
      }

      if (!response) {
        return {} as ApiResponse<TData>;
      }

      return response as ApiResponse<TData>;
    },
    ...options,
  });
};
