import { useState } from 'react';
import styles from '../CourseDetail.module.css';
import Text from '@/components/Text';
import type { Unit } from '../repository/type';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { TextType } from '@/components/Text/types';

export const UnitSection = ({ unit, isLastAccessed }: { unit: Unit; isLastAccessed: boolean }) => {
  const [isOpen, setIsOpen] = useState(isLastAccessed);
  const { navigateTo } = useNativeBridge();
  const res = [1, 2, 3, 4];

  return (
    <view className={styles.unitContainer}>
      <view
        key={unit.id}
        className={styles.unitItem}
        bindtap={() => {
          if (unit.progress.is_locked) return;
          setIsOpen(!isOpen);
        }}
        style={{ borderColor: isOpen ? Colors.Primary : '' }}
      >
        <view
          className={
            unit.progress.status == 'completed' ? styles.checkCircleActive : styles.checkCircle
          }
        >
          <Text className={styles.lessonNumber}>{unit.order}</Text>
        </view>
        <view className={styles.lessonInfo}>
          <Text
            className={unit.progress.is_locked ? styles.lessonTitleLocked : styles.lessonTitle}
            size={TextType.b2}
          >
            {unit.title}
          </Text>
          <Text className={styles.lessonMeta}>
            {unit.progress.completed_items} / {unit.progress.total_items} Completed Lessons
          </Text>
        </view>
        <Text className={`${styles.arrowIcon} ${isOpen ? styles.arrowOpen : ''}`}>
          {unit.progress.is_locked ? '🔒' : '▼'}
        </Text>

        {unit.progress.is_locked && <view className={styles.locked}></view>}
      </view>

      {/* Collapsible Content */}
      <view className={`${styles.lessonListWrapper} ${isOpen ? styles.lessonListVisible : ''}`}>
        <view className={styles.lessonList}>
          {unit.elements.map((lesson) => (
            <view
              key={lesson.id}
              className={styles.lessonItem}
              bindtap={() => navigateTo('lessons.lynx.bundle', { lessonId: lesson })}
            >
              <view
                className={
                  unit.progress.status == 'completed'
                    ? styles.checkCircleActive
                    : styles.checkCircle
                }
              >
                <Text className={styles.lessonNumber} size={TextType.b3}>
                  {lesson.sequence}
                </Text>
              </view>
              <Text className={styles.lessonNumber} size={TextType.b2}>
                {lesson.title}
              </Text>
              {/* <view className={styles.lessonInfo}>
            //     <Text
            //       className={
            //         lesson.progress.is_locked ? styles.lessonTitleLocked : styles.lessonTitle
            //       }
            //     >
            //       {lesson.title}
            //     </Text>
            //     <Text className={styles.lessonMeta}>
            //       {lesson.progress.completed_items} / {lesson.progress.total_items} Items
            //     </Text>
            //   </view> */}
              // {/* {lesson.progress.is_locked && <Text className={styles.lockIcon}>🔒</Text>} */}
            </view>
          ))}
        </view>
      </view>
    </view>
  );
};
