export type AssignmentSubmissionType = 'text' | 'file' | 'mixed';
export type AssignmentStatus = 'draft' | 'published' | 'archived';

export interface AssignmentAttachment {
  id: number;
  file_name: string;
  file_url: string;
  url: string;
  mime_type: string;
  size: number;
}

export interface AssignmentUnit {
  id: number | null;
  slug: string | null;
  title: string | null;
  code: string | null;
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
  accepted_formats: string[];
  max_file_size: number;
}

export interface PickedFile {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}
