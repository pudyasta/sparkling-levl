export type Category = 'All' | 'Mobile Development' | 'Programming' | 'Design';

export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Course {
  id: string;
  title: string;
  level: Level;
  description: string;
  lessons: number;
  category: Category;
  completed?: boolean;
}
