import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

import type {
  GetQuestionByPageResponse,
  GetQuizSubmissionsResponse,
  SaveAnswerPayload,
  SaveAnswerResponse,
  StartQuizResponse,
  SubmitQuizResponse,
} from '../type/QuizData';

const ENDPOINTS = {
  START: '/quizzes/QUIZ_ID/submissions/start',
  QUESTION: '/quiz-submissions/SUBMISSION_ID/questions',
  ANSWER: '/quiz-submissions/SUBMISSION_ID/answers',
  SUBMIT: '/quiz-submissions/SUBMISSION_ID/submit',
  RESULTS: '/quizzes/QUIZ_ID/submissions',
};

export const useQuizRepo = () => {
  const { api } = useApiClient();

  const startQuizApi = async (quizId: number): Promise<StartQuizResponse> => {
    const res = await api(ENDPOINTS.START.replace('QUIZ_ID', String(quizId)), {
      method: POST_METHOD,
    });
    console.log(JSON.stringify(res, null, 2));
    return res?.data;
  };

  const getQuestionApi = async (
    submissionId: number,
    page: number
  ): Promise<GetQuestionByPageResponse> => {
    const res = await api(
      `${ENDPOINTS.QUESTION.replace('SUBMISSION_ID', String(submissionId))}?page=${page}`,
      { method: GET_METHOD }
    );
    return res?.data;
  };

  const saveAnswerApi = async (
    submissionId: number,
    payload: SaveAnswerPayload
  ): Promise<SaveAnswerResponse> => {
    const res = await api(ENDPOINTS.ANSWER.replace('SUBMISSION_ID', String(submissionId)), {
      method: POST_METHOD,
      data: payload,
    });
    return res?.data;
  };

  const submitQuizApi = async (submissionId: number): Promise<SubmitQuizResponse> => {
    const res = await api(ENDPOINTS.SUBMIT.replace('SUBMISSION_ID', String(submissionId)), {
      method: POST_METHOD,
    });
    return res?.data;
  };

  const getResultsApi = async (quizId: number): Promise<GetQuizSubmissionsResponse> => {
    const res = await api(
      `${ENDPOINTS.RESULTS.replace('QUIZ_ID', String(quizId))}?include=answers,answers.question,quiz,quiz.questions`,
      { method: GET_METHOD }
    );
    return res?.data;
  };

  return {
    startQuizApi,
    getQuestionApi,
    saveAnswerApi,
    submitQuizApi,
    getResultsApi,
  };
};
