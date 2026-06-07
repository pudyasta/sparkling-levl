import { setItem } from 'sparkling-storage';

import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { QUIZ_OVERVIEW_ENDPOINT, TAKEOVER_QUIZ_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';

import type {
  ApiResponse,
  GetQuestionByPageResponse,
  GetQuizSubmissionsResponse,
  QuizOverviewData,
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
  RESULTS: '/quiz-submissions/QUIZ_ID',
};

export const useQuizRepo = () => {
  const { api } = useApiClient();

  const startQuizApi = async (quizId: number): Promise<StartQuizResponse> => {
    const res = await api(ENDPOINTS.START.replace('QUIZ_ID', String(quizId)), {
      method: POST_METHOD,
    });

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
    setItem(
      {
        key: PrefKey.SubmissionId + submissionId,
        biz: BizKey.Quiz,
        data: {},
      },
      (res) => {}
    );
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

    return res?.data;
  };

  const getQuizOverviewApi = async (
    submissionId: number,
    sessionToken: string
  ): Promise<ApiResponse<QuizOverviewData>> => {
    const res = await api(QUIZ_OVERVIEW_ENDPOINT.replace('SUBMISSION_ID', String(submissionId)), {
      method: GET_METHOD,
      headers: { 'X-Session-Token': sessionToken },
    });
    return res?.data;
  };

  return {
    startQuizApi,
    getQuestionApi,
    saveAnswerApi,
    submitQuizApi,
    getResultsApi,
    takeoverQuizApi,
    getQuizOverviewApi,
  };
};
