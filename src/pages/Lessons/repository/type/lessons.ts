/**
 * Detailed Lesson Data
 */
export interface LessonData {
  id: number;
  unit_id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  status: 'published' | 'draft' | 'archived'; // Specific literal types for status
  created_at: string; // ISO 8601 Date string
  updated_at: string;
  xp_reward: number;
  is_completed: boolean;
  is_locked: boolean;
  blocks: LessonBlock[];
}

/**
 * Content Block Types
 */
export type BlockType = 'text' | 'file' | 'image' | 'video' | 'embed';

export interface LessonBlock {
  id: number;
  lesson_id: number;
  slug: string;
  block_type: BlockType;
  content: string;
  order: number;
  external_url: string | null;
  embed_url: string | null;
  media: MediaMetadata | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Media Attachment Metadata
 */
export interface MediaMetadata {
  id: number;
  url: string;
  file_name: string;
  mime_type: string;
  size: number; // Size in bytes
}

/**
 * Request getting lessons
 */
export interface GetLessonsRequest {
  type: 'lesson';
  course_slug: string;
  unit_slug: string;
  lesson_slug: string;
}
