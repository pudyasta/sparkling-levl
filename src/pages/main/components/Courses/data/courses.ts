import type { Course } from '../type';
import type { Category } from '../type';

export const COURSES: Course[] = [
  {
    id: 'flutter-basics',
    title: 'Flutter Basics',
    level: 'Beginner',
    description: 'Get started building cross-platform mobile apps.',
    lessons: 24,
    category: 'Mobile Development',
    completed: true,
  },
  {
    id: 'dart-mastery',
    title: 'Dart Mastery',
    level: 'Intermediate',
    description: 'Master Dart language features and best practices.',
    lessons: 30,
    category: 'Programming',
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX Design Principles',
    level: 'Beginner',
    description: 'Learn core principles of modern product design.',
    lessons: 18,
    category: 'Design',
  },
];

export const CATEGORIES: Category[] = [
  'All',
  'Mobile Development',
  'Programming',
  'Design',
];
