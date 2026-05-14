export type AssignmentSubmissionType = 'text' | 'file' | 'mixed';
export type AssignmentReviewMode = 'immediate' | 'manual' | 'deferred' | 'hidden';
export type AssignmentStatus = 'draft' | 'published' | 'archived';

export interface AssignmentCourse {
  id: number;
  slug: string;
  title: string;
  code: string;
}

export interface AssignmentUnit {
  id: number | null;
  slug: string | null;
  title: string | null;
  code: string | null;
  course: AssignmentCourse | null;
}

export interface AssignmentAttachment {
  id: number;
  file_name: string;
  file_url: string;
  url: string;
  mime_type: string;
  size: number;
}

export interface AssignmentCreator {
  id: number;
  name: string;
  email?: string;
}

export interface AssignmentPrerequisite {
  id: number;
  title: string;
}

export interface AssignmentInstructorResponse {
  id: number;
  title: string;
  sequence: string | null;
  instructions: string | null;
  submission_type: AssignmentSubmissionType | null;
  max_score: number | null;
  passing_grade: string | number | null;
  time_limit_minutes: number | null;
  review_mode: AssignmentReviewMode | null;
  status: AssignmentStatus | null;
  accepted_formats: string[];
  max_file_size: number;
  grading_scheme: string;
  unit_slug: string | null;
  course_slug: string | null;
  unit: AssignmentUnit;
  is_available: boolean;
  created_at: string | null;
  updated_at: string | null;
  creator?: AssignmentCreator | null;
  questions_count?: number;
  prerequisites?: AssignmentPrerequisite[];
  attached_files: AssignmentAttachment[];
  attachments: AssignmentAttachment[];
}

export interface AssignmentSubmissionFile {
  id: number;
  file_name: string;
  file_url: string;
  url: string;
  size: number;
  mime_type: string;
}

export interface AssignmentSubmission {
  id: number;
  attempt_number: number;
  status: string;
  score: number | null;
  answer_text: string | null;
  submitted_at: string | null;
  feedback: string | null;
  graded_at: string | null;
  files: AssignmentSubmissionFile[];
}

export interface AssignmentStudentResponse {
  id: number;
  title: string;
  order: number;
  description: string | null;
  instructions: string | null;
  submission_type: AssignmentSubmissionType | null;
  max_score: number | null;
  passing_grade: string | number | null;
  status: AssignmentStatus | null;
  grading_scheme: string;
  unit_slug: string | null;
  course_slug: string | null;
  unit: AssignmentUnit;
  is_locked: boolean;
  is_completed: boolean;
  submission_status: string | null;
  submission_status_label: string;
  score: number | null;
  submitted_at: string | null;
  is_submission_completed: boolean;
  attempts_used: number;
  xp_reward: number;
  xp_perfect_bonus: number;
  attached_files: AssignmentAttachment[];
  attachments: AssignmentAttachment[];
  submissions: AssignmentSubmission[];
  creator?: {
    id: number;
    name: string;
  } | null;
  created_at: string | null;
  updated_at: string | null;
  accepted_formats: string[];
  max_file_size: number;
}

export interface GetAssginmentRequest {
  type: 'assignment';
  assignment_id: number;
}

export type AssignmentShowResponse = AssignmentInstructorResponse | AssignmentStudentResponse;

export interface SubmissionFinalResponseData {
  id: number;
  assignment_id: number;
  assignment_title: string;
  status: SubmissionStatus;
  attempt_number: number;
  submitted_at: string;
  duration: number;
  duration_formatted: string;
  summary: SubmissionSummary;
  student: SubmissionStudent;
}

export type SubmissionStatus = 'submitted' | 'draft' | 'graded' | 'pending';

export interface SubmissionSummary {
  total_questions: number;
  answered: number;
  pending_grade: boolean;
}

export interface SubmissionStudent {
  id: number;
  name: string;
}

export interface SubmitFinalAssignmentRequest {
  submission_id: number;
}
