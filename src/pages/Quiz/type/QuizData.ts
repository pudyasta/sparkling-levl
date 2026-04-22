export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: null | Record<string, unknown>;
  errors: null | Record<string, unknown>;
}

export type QuizQuestionType = 'multiple_choice' | 'checkbox' | 'true_false' | 'essay';

export interface QuizAnswerOption {
  [key: string]: unknown;
}

export interface QuizQuestionBase {
  id: number;
  quiz_id: number;
  type: QuizQuestionType | null;
  type_label: string | null;
  content: string | null;
  options: unknown;
  weight: number | null;
  order: number | null;
  max_score: number | null;
  can_auto_grade: boolean;
  requires_options: boolean;
  created_at: string | null;
}

export interface QuizQuestionWithAnswerKey extends QuizQuestionBase {
  answer_key?: unknown;
  option_images?: Array<{
    id: number;
    url: string;
  }>;
}

export interface QuizAnswer {
  id: number;
  content: string | null;
  selected_options: unknown;
}

export interface QuizSubmissionQuestionMeta {
  current_page: number;
  per_page: number;
  total: number;
  has_previous: boolean;
  has_next: boolean;
  current_order: number;
  total_questions: number;
}

export interface QuizSubmissionStudentQuestionsResponse {
  data: QuizQuestionBase;
  meta: QuizSubmissionQuestionMeta;
  answer?: QuizAnswer;
}

export interface QuizSubmissionInstructorQuestionsResponse extends Array<QuizQuestionWithAnswerKey> {}

export type QuizSubmissionQuestionsResponse =
  | QuizSubmissionStudentQuestionsResponse
  | QuizSubmissionInstructorQuestionsResponse;

export interface QuizQuestionNavigationAtOrder {
  question: QuizQuestionBase;
  navigation: QuizSubmissionQuestionMeta;
}
