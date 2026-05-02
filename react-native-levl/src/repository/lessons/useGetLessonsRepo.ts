import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

export const useLessonsRepository = () => {
  const { api } = useApiClient();

  const getLessonApi = async (params: {
    course_slug: string;
    unit_slug: string;
    lesson_slug: string;
  }) => {
    const response = await api(
      `/courses/${params.course_slug}/units/${params.unit_slug}/lessons/${params.lesson_slug}`,
      { method: GET_METHOD }
    );
    return response?.data;
  };

  const getAssignmentApi = async (assignmentId: number) => {
    const response = await api(`/assignments/${assignmentId}`, { method: GET_METHOD });
    return response?.data;
  };

  const getQuizForLessonApi = async (quizId: number) => {
    const response = await api(`/quizzes/${quizId}`, { method: GET_METHOD });
    return response?.data;
  };

  const markAsDoneApi = async (lessonSlug: string) => {
    const response = await api(`/lessons/${lessonSlug}/complete`, { method: POST_METHOD });
    return response?.data;
  };

  const submitAssignmentApi = async (assignmentId: number, data: Record<string, any>) => {
    const response = await api(`/assignments/${assignmentId}/submissions`, {
      method: POST_METHOD,
      data,
    });
    return response?.data;
  };

  return { getLessonApi, getAssignmentApi, getQuizForLessonApi, markAsDoneApi, submitAssignmentApi };
};
