import { GET_METHOD } from '@/constant/api';
import {
  ASSIGNMENT_DETAIL_ENDPOINT,
  LESSON_DETAIL_ENDPOINT,
  QUIZ_DETAIL_ENDPOINT,
} from '@/constant/route';
import { type ApiResponse, useApiClient } from '@/lib/api/core';

import type { AssignmentStudentResponse, GetAssginmentRequest } from './type/assignment';
import type { GetLessonsRequest, LessonData } from './type/lessons';
import type { GetQuizRequest } from './type/quiz';

export const useGetLessonsRepo = () => {
  const { api } = useApiClient();

  const getLessons = async (request: GetLessonsRequest) => {
    const url = LESSON_DETAIL_ENDPOINT.replace('COURSE_SLUG', request.course_slug)
      .replace('UNIT_SLUG', request.unit_slug)
      .replace('LESSON_SLUG', request.lesson_slug);

    const response = await api(url, {
      method: GET_METHOD,
    });

    if (!response) {
      console.log(response);
      return null;
    }

    return response.data as ApiResponse<LessonData>;
  };

  const getAssignment = async (request: GetAssginmentRequest) => {
    const url = ASSIGNMENT_DETAIL_ENDPOINT.replace(
      'ASSIGNMENT_ID',
      request.assignment_id.toString()
    );

    const response = await api(url, {
      method: GET_METHOD,
    });

    if (!response) {
      console.log(response);
      return null;
    }

    return response.data as ApiResponse<AssignmentStudentResponse>;
  };

  const getQuiz = async (request: GetQuizRequest) => {
    const url = QUIZ_DETAIL_ENDPOINT.replace('QUIZ_ID', request.quiz_id.toString());

    const response = await api(url, {
      method: GET_METHOD,
    });

    if (!response) {
      console.log(response);
      return null;
    }

    return response.data as ApiResponse<AssignmentStudentResponse>;
  };

  return {
    getLessons,
    getAssignment,
    getQuiz,
  };
};
