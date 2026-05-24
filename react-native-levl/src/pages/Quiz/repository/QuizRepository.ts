import { GET_METHOD, POST_METHOD, PUT_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

export const useQuizRepository = () => {
  const { api } = useApiClient();

  return {
    startQuizApi: (quizId: number) =>
      api(`/quizzes/${quizId}/submissions/start`, { method: POST_METHOD })
        .then((r: any) => r?.data),

    getQuizQuestionApi: (submissionId: number, page: number) =>
      api(`/quiz-submissions/${submissionId}/questions?page=${page}`, { method: GET_METHOD })
        .then((r: any) => r?.data),

    saveAnswerApi: (submissionId: number, questionId: number, payload: { content?: string; selected_options?: string[] }) =>
      api(`/quiz-submissions/${submissionId}/questions/${questionId}/answer`, {
        method: PUT_METHOD,
        data: payload,
      }).then((r: any) => r?.data),

    submitQuizApi: (submissionId: number) =>
      api(`/quiz-submissions/${submissionId}/submit`, { method: POST_METHOD })
        .then((r: any) => r?.data),

    getQuizOverviewApi: (submissionId: number) =>
      api(`/quiz-submissions/${submissionId}/overview`, { method: GET_METHOD })
        .then((r: any) => r?.data),
  };
};
