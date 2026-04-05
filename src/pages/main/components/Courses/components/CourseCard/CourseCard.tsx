import Card from '../../../../../../components/common/Card/Card';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  bindTap?: (e: any) => void;
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    lessons: number;
    category: string;
    completed: boolean;
  };
}
const CourseCard: React.FC<CourseCardProps> = ({ bindTap, course }) => {
  return (
    <Card bindTap={bindTap} className={styles.cardContainer}>
      <view className={styles.contentWrapper}>
        <view className={styles.headerArea}>
          <text className={styles.title}>{course.title}</text>
          <view className={styles.badge}>
            <text className={styles.badgeText}>{course.level}</text>
          </view>
        </view>

        <text className={styles.description}>{course.description}</text>

        <view className={styles.metaRow}>
          <text className={styles.metaText}>📚 {course.lessons} lessons</text>
          <text className={styles.metaText}>🏷 {course.category}</text>
        </view>
      </view>

      <view className={styles.statusIconWrapper}>
        {course.completed ? (
          <text className={styles.iconCompleted}>✔️</text>
        ) : (
          <text className={styles.iconPending}>○</text>
        )}
      </view>
    </Card>
  );
};
export default CourseCard;
