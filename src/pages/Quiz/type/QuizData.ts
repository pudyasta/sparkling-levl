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

export type QuizSubmissionStatus = 'draft' | 'submitted' | 'graded' | 'missing';
export type QuizGradingStatus = 'pending' | 'partially_graded' | 'waiting_for_grading' | 'graded';

export interface QuizSubmissionResource {
  id: number;
  attempt_number: number;
  status: QuizSubmissionStatus;
  status_label: string;
  grading_status: QuizGradingStatus;
  grading_status_label: string;
  score: number | null;
  final_score: number | null;
  is_passed?: boolean;
  started_at: string | null;
  submitted_at: string | null;
  time_spent_seconds: number | null;
  duration: number | null;
  quiz?: QuizResource;
  answers?: QuizAnswerResource[];
  // Instructor-only fields
  quiz_id?: number;
  user_id?: number;
  enrollment_id?: number;
  is_late?: boolean;
  is_resubmission?: boolean;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestionResource {
  id: number;
  quiz_id: number;
  type: string;
  type_label: string;
  content: string;
  options: string[] | null;
  answer_key?: string[] | null;
  weight: number;
  order: number;
  max_score: number;
  can_auto_grade: boolean;
  requires_options: boolean;
  option_images?: Array<{
    id: number;
    url: string;
  }>;
  created_at: string;
}

export interface QuizAnswerResource {
  id: number;
  quiz_question_id: number;
  content: string | null;
  selected_options: string[] | null;
  score: number | null;
  feedback: string | null;
  is_auto_graded?: boolean;
  question?: QuizQuestionResource;
}

export interface QuizResource {
  id: number;
  title: string;
  sequence: string | null;
  description: string | null;
  passing_grade: number;
  max_score: number;
  time_limit_minutes: number | null;
  auto_grading: boolean;
  review_mode: string;
  randomization_type: string;
  question_bank_count: number;
  status: string;
  status_label: string;
  is_locked?: boolean;
  unit_slug: string | null;
  course_slug: string | null;
  unit?: {
    id: number;
    slug: string;
    title: string;
    code: string | null;
    course?: {
      id: number;
      slug: string;
      title: string;
      code: string | null;
    };
  };
  questions_count?: number;
  questions?: QuizQuestionResource[];
  scope_type?: string;
  attachments?: Array<{
    id: number;
    name: string;
    url: string;
    mime_type: string;
    size: number;
  }>;
  submission_status?: string;
  submission_status_label?: string;
  score?: number;
  submitted_at?: string;
  is_completed?: boolean;
  attempts_used?: number;
  xp_reward?: number;
  xp_perfect_bonus?: number;
  created_at: string;
  // Instructor-only fields
  available_from?: string;
  tolerance_minutes?: number;
  late_penalty_percent?: number;
  assignable_type?: string;
  assignable_id?: number;
  lesson_id?: number;
  created_by?: number;
  creator?: {
    id: number;
    name: string;
  };
  updated_at?: string;
}

// Specific endpoint response types

export type StartQuizResponse = ApiResponse<QuizSubmissionResource>;

export interface GetQuestionResponse {
  data: QuizQuestionResource;
  meta: {
    pagination: {
      current_page: number;
      total: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
  answer?: {
    id: number;
    content: string | null;
    selected_options: string[] | null;
  };
}

export type GetQuestionByPageResponse = ApiResponse<GetQuestionResponse>;

export interface GetQuestionAtOrderResponse {
  question: QuizQuestionResource;
  navigation: {
    total: number;
    current_order: number;
    has_previous: boolean;
    has_next: boolean;
  };
}

export type GetQuestionAtOrderApiResponse = ApiResponse<GetQuestionAtOrderResponse>;

export type SaveAnswerResponse = ApiResponse<QuizAnswerResource>;

export type SubmitQuizResponse = ApiResponse<QuizSubmissionResource>;

export type GetQuizSubmissionsResponse = ApiResponse<QuizSubmissionResource[]>;

export type GetQuizSubmissionDetailResponse = ApiResponse<QuizSubmissionResource>;

export interface SaveAnswerPayload {
  quiz_question_id: number;
  selected_options: number[] | null;
  content: string | null;
}
