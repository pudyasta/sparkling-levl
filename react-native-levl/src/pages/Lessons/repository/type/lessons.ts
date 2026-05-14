export interface LessonData {
  id: number;
  unit_id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  duration_minutes: number;
  xp_reward: number;
  is_completed: boolean;
  is_locked: boolean;
  blocks: LessonBlock[];
}

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
}

export interface MediaMetadata {
  id: number;
  url: string;
  file_name: string;
  mime_type: string;
  size: number;
}

export interface LessonResponse {
  success: boolean;
  message: string;
  data: LessonData;
  meta: null | any;
  errors: null | any;
}
