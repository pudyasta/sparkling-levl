import { getItem } from 'sparkling-storage';

import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { TAKEOVER_QUIZ_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';

import type {
  GetQuestionByPageResponse,
  GetQuizSubmissionsResponse,
  SaveAnswerPayload,
  SaveAnswerResponse,
  StartQuizResponse,
  SubmitQuizResponse,
  TakeoverQuizResponse,
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
    console.log('startQuizApi', JSON.stringify(res, null, 2));

    return res?.data;
  };

  const getQuestionApi = async (
    submissionId: number,
    page: number,
    sessionToken: string
  ): Promise<GetQuestionByPageResponse> => {
    const res = await api(
      `${ENDPOINTS.QUESTION.replace('SUBMISSION_ID', String(submissionId))}?page=${page}`,
      {
        method: GET_METHOD,
        headers: {
          'X-Session-Token': sessionToken,
        },
      }
    );
    // console.log('getQuestionApi', JSON.stringify(res, null, 2));

    return res?.data;
  };

  const saveAnswerApi = async (
    submissionId: number,
    payload: SaveAnswerPayload,
    sessionToken: string
  ): Promise<SaveAnswerResponse> => {
    const res = await api(ENDPOINTS.ANSWER.replace('SUBMISSION_ID', String(submissionId)), {
      method: POST_METHOD,
      data: payload,
      headers: {
        'X-Session-Token': sessionToken,
      },
    });
    console.log('saveAnswerApi', JSON.stringify(res, null, 2));
    return res?.data;
  };

  const submitQuizApi = async (
    submissionId: number,
    sessionToken: string
  ): Promise<SubmitQuizResponse> => {
    const res = await api(ENDPOINTS.SUBMIT.replace('SUBMISSION_ID', String(submissionId)), {
      method: POST_METHOD,
      headers: {
        'X-Session-Token': sessionToken,
      },
    });
    console.log('useSubmitQuiz error:', JSON.stringify(res, null, 2));

    return res?.data;
  };

  const getResultsApi = async (quizId: number): Promise<GetQuizSubmissionsResponse> => {
    const res = await api(
      `${ENDPOINTS.RESULTS.replace('QUIZ_ID', String(quizId))}?include=answers,answers.question,quiz,quiz.questions`,
      { method: GET_METHOD }
    );
    return res?.data;
  };

  const takeoverQuizApi = async (submissionId: number): Promise<TakeoverQuizResponse> => {
    const res = await api(TAKEOVER_QUIZ_ENDPOINT.replace('SUBMISSION_ID', String(submissionId)), {
      method: POST_METHOD,
    });
    console.log(JSON.stringify(res, null, 2));

    return res?.data;
  };
  return {
    startQuizApi,
    getQuestionApi,
    saveAnswerApi,
    submitQuizApi,
    getResultsApi,
    takeoverQuizApi,
  };
};
