import type { ApiResponse } from '@/lib/api/core';

export type EnrollmentType = 'auto_accept' | 'key_based' | 'approval';

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface EnrollmentUser {
  id: number;
  name: string;
  email: string;
  username?: string | null;
  avatar_url?: string | null;
}

export interface EnrollmentCourse {
  id: number;
  title: string;
  slug: string;
  code?: string | null;
}

export interface EnrollmentProgressSummary {
  completed: number;
  total: number;
  text: string;
}

export interface EnrollmentAssignmentsSummary {
  submitted: number;
  graded: number;
  text: string;
}

export interface EnrollmentQuizzesSummary {
  passed: number;
  average_score: number;
  text: string;
}

export interface EnrollmentResource {
  id: number;
  status: EnrollmentStatus;
  progress: number;
  enrolled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: EnrollmentUser;
  course?: EnrollmentCourse;
  completed_units?: EnrollmentProgressSummary | null;
  assignments?: EnrollmentAssignmentsSummary | null;
  quizzes?: EnrollmentQuizzesSummary | null;
}

export type CourseEnrollResponse = ApiResponse<EnrollmentResource>;

export interface EnrollCoursePayload {
  enrollment_key?: string;
}
