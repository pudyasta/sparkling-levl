import { useState } from 'react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import styles from '../CourseDetail.module.css';
import type { Unit } from '../repository/type';

export const UnitSection = ({ unit, isLastAccessed }: { unit: Unit; isLastAccessed: boolean }) => {
  const [isOpen, setIsOpen] = useState(isLastAccessed);
  const { navigateTo } = useNativeBridge();

  return (
    <view className={styles.unitContainer}>
      <view
        key={unit.id}
        className={styles.unitItem}
        bindtap={() => {
          if (unit.progress?.is_locked || unit.progress?.is_locked === undefined) return;
          setIsOpen(!isOpen);
        }}
        style={{ borderColor: isOpen ? Colors.Primary : '' }}
      >
        <view
          className={
            unit?.progress?.status && unit.progress.status == 'completed'
              ? styles.checkCircleActive
              : styles.checkCircle
          }
        >
          <Text className={styles.lessonNumber}>{unit.order}</Text>
        </view>
        <view className={styles.lessonInfo}>
          <Text
            className={unit.progress?.is_locked ? styles.lessonTitleLocked : styles.lessonTitle}
            size={TextType.b2}
          >
            {unit.title}
          </Text>
          <Text className={styles.lessonMeta}>
            {unit.progress?.completed_items} / {unit.progress?.total_items} Completed Lessons
          </Text>
        </view>
        <Text className={`${styles.arrowIcon} ${isOpen ? styles.arrowOpen : ''}`}>
          {unit.progress?.is_locked ? '🔒' : '▼'}
        </Text>

        {(unit.progress?.is_locked || unit.progress?.is_locked === undefined) && (
          <view className={styles.locked}></view>
        )}
      </view>

      {/* Collapsible Content */}
      <view className={`${styles.lessonListWrapper} ${isOpen ? styles.lessonListVisible : ''}`}>
        <view className={styles.lessonList}>
          {unit.elements &&
            unit.elements?.map((lesson, i) => (
              <view
                key={lesson.id}
                className={styles.lessonItem}
                bindtap={() => {
                  console.log('length', unit.elements.length);
                  navigateTo('lessons.lynx.bundle', {
                    lesson_slug: lesson.slug,
                    unit_slug: unit.slug,
                    course_slug: unit?.course_slug || '',
                    all_lessons: unit.elements,
                    close: true,
                    next_course: i < unit.elements.length - 1 ? unit.elements[i + 1].slug : null,
                    back_course: i > 0 ? unit.elements[i - 1].slug : null,
                    type: lesson.type,
                    assignment_id: lesson.id,
                  });
                }}
              >
                <view
                  className={lesson.is_completed ? styles.checkCircleActive : styles.checkCircle}
                >
                  <Text
                    className={styles.lessonNumber}
                    size={TextType.b3}
                    color={lesson.is_completed ? 'white' : ''}
                  >
                    {lesson.is_completed ? '✓' : lesson.sequence}
                  </Text>
                </view>
                <Text className={styles.lessonNumber} size={TextType.b2}>
                  {lesson.title}
                </Text>
              </view>
            ))}
        </view>
      </view>
    </view>
  );
};
