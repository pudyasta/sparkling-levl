import { useState } from 'react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import type { Unit } from '../repository/type';

export const UnitSection = ({
  unit,
  isLastAccessed,
  courseId,
  courseSlug,
}: {
  unit: Unit;
  isLastAccessed: boolean;
  courseId: number;
  courseSlug?: string;
}) => {
  const [isOpen, setIsOpen] = useState(isLastAccessed);
  const { navigateTo } = useNativeBridge();

  return (
    <view className="mb-1 overflow-hidden">
      <view
        key={unit.id}
        className={`flex-row items-center rounded-2xl border bg-surface px-6 py-3 flex overflow-hidden ${
          isOpen ? 'border-primary' : 'border-light'
        }`}
        bindtap={() => {
          if (unit.progress?.is_locked || unit.progress?.is_locked === undefined) return;
          setIsOpen(!isOpen);
        }}
      >
        {/* Check circle */}
        <view
          className={`mr-4 h-10 w-10 items-center rounded-full justify-center ${
            unit.progress?.status == 'completed' ? 'bg-green-500' : 'bg-surface-alt'
          }`}
        >
          <Text color={unit.progress?.status == 'completed' ? 'white' : ''}>{unit.order}</Text>
        </view>

        {/* Lesson info */}
        <view className="flex-1">
          <Text
            className={
              unit.progress?.is_locked
                ? 'text-base font-semibold text-subtle'
                : 'text-base font-bold text-neutral'
            }
            size={TextType.b2}
          >
            {unit.title}
          </Text>
          <Text className="mt-0.5 text-sm text-subtle">
            {unit.progress?.completed_items} / {unit.progress?.total_items} Completed Lessons
          </Text>
        </view>

        {/* Arrow / lock */}
        <Text className={`${isOpen ? 'rotate-180' : ''}`}>
          {unit.progress?.is_locked ? '🔒' : '▼'}
        </Text>

        {/* Locked overlay */}
        {(unit.progress?.is_locked || unit.progress?.is_locked === undefined) && (
          <view className="items-center bg-surface/80 flex absolute inset-0 justify-center" />
        )}
      </view>

      {/* Collapsible lesson list */}
      <view
        className={`overflow-hidden transition-all duration-500 ${
          isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <view
          className={`bg-canvas transition-transform duration-500 ${
            isOpen ? 'translate-y-0' : '-translate-y-2.5'
          }`}
        >
          {unit.elements?.map((lesson, i) => (
            <view
              key={lesson.id}
              className="flex-row items-center border border-light bg-surface px-6 py-3 flex"
              bindtap={() => {
                console.log(lesson);
                if (lesson.is_locked) return;
                navigateTo('lessons', {
                  lesson_slug: lesson.slug,
                  courseId,
                  unit_slug: unit.slug,
                  course_slug: unit?.course_slug || '',
                  all_lessons: unit.elements,
                  next_course: i < unit.elements.length - 1 ? unit.elements[i + 1].slug : null,
                  back_course: i > 0 ? unit.elements[i - 1].slug : null,
                  type: lesson.type,
                  assignment_id: lesson.id,
                });
              }}
            >
              {/* Check circle */}
              <view
                className={`mr-4 h-10 w-10 items-center rounded-full justify-center ${
                  lesson.is_completed ? 'bg-green-500' : 'bg-surface-alt'
                }`}
              >
                <Text
                  className="text-sm font-bold"
                  size={TextType.b3}
                  color={lesson.is_completed ? 'white' : ''}
                >
                  {lesson.is_completed ? '✓' : lesson.sequence}
                </Text>
              </view>

              <Text className="text-sm font-bold text-muted" size={TextType.b2}>
                {lesson.title}
              </Text>

              {/* Locked overlay */}
              {(lesson.is_locked || lesson.is_locked === undefined) && (
                <view className="items-center bg-surface/80 flex absolute inset-0 justify-center" />
              )}
            </view>
          ))}
        </view>
      </view>
    </view>
  );
};
