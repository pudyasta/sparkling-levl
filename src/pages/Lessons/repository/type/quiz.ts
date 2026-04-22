export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: null | Record<string, unknown>;
  errors: null | Record<string, unknown>;
}

export type QuizStatus = 'draft' | 'published' | 'archived';
export type QuizRandomizationType = 'static' | 'random_order' | 'bank';
export type QuizReviewMode = 'immediate' | 'manual' | 'deferred' | 'hidden';
export type QuizSubmissionStatus = 'draft' | 'submitted' | 'graded' | 'returned' | null;

export interface QuizCourse {
  id: number;
  slug: string;
  title: string;
  code: string;
}

export interface QuizUnit {
  id: number;
  slug: string;
  title: string;
  code: string;
  course?: QuizCourse | null;
}

export interface QuizAttachment {
  id: number;
  name: string;
  url: string;
  mime_type: string;
  size: number;
}

export interface QuizCreator {
  id: number;
  name: string;
}

export interface QuizOptionImage {
  id: number;
  url: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: number;
  type: string | null;
  type_label: string | null;
  content: string | null;
  options: unknown;
  answer_key?: unknown;
  weight: number | null;
  order: number | null;
  max_score: number | null;
  can_auto_grade: boolean;
  requires_options: boolean;
  option_images?: QuizOptionImage[];
  created_at: string | null;
}

export interface QuizStudentResponse {
  id: number;
  title: string;
  sequence: string | null;
  description: string | null;
  passing_grade: string | number | null;
  max_score: number | null;
  time_limit_minutes: number | null;
  auto_grading: boolean;
  review_mode: QuizReviewMode | null;
  randomization_type: QuizRandomizationType | null;
  question_bank_count: number | null;
  status: QuizStatus | null;
  status_label: string | null;
  is_locked: boolean;
  unit_slug: string | null;
  course_slug: string | null;
  unit?: QuizUnit | null;
  questions_count?: number | null;
  scope_type: string;
  attachments?: QuizAttachment[];
  submission_status: QuizSubmissionStatus;
  submission_status_label: string;
  score: number | null;
  submitted_at: string | null;
  is_completed: boolean;
  attempts_used: number;
  xp_reward: number;
  xp_perfect_bonus: number;
  creator?: QuizCreator | null;
  created_at: string | null;
  updated_at: string | null;
  order: number;
}

export interface GetQuizRequest {
  type: 'quiz';
  quiz_id: number;
}
