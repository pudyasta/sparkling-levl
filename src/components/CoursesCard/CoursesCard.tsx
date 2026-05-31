import { memo, useMemo } from '@lynx-js/react';

import { Colors } from '@/constant/style';
import { htmlToPlainText } from '@/lib/helper/htmlToLynx';

import Text from '../Text';
import { TextType } from '../Text/types';
import Badge from '../common/Badge/Badge';

const LEVEL_VARIANT: Record<string, 'info' | 'warning' | 'danger'> = {
  DASAR: 'info',
  MENENGAH: 'warning',
  MAHIR: 'danger',
};

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    lessons: number;
    category: string;
    image: string;
  };
  bindTap: () => void;
}

const CourseCard = memo<CourseCardProps>(({ course, bindTap }) => {
  const levelVariant = LEVEL_VARIANT[course.level?.toUpperCase()] ?? 'neutral';
  const excerpt = useMemo(
    () =>
      course.description
        ? htmlToPlainText(course.description).split(' ').slice(0, 30).join(' ') + '...'
        : '',
    [course.description],
  );

  return (
    <view
      bindtap={bindTap}
      style={{
        backgroundColor: Colors.Surface,
        borderRadius: '12px',
        border: `1px solid ${Colors.Border}`,
        marginBottom: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Banner image — 128px per design spec */}
      {course.image ? (
        <view
          style={{
            backgroundImage: `url(${course.image})`,
            height: '128px',
            width: '100%',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      ) : (
        <view style={{ height: '128px', backgroundColor: Colors.N100 }} />
      )}

      {/* Content */}
      <view style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Level badge */}
        {course.level && (
          <Badge variant={levelVariant}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
          </Badge>
        )}

        {/* Title — 14px 600 max 2 lines */}
        <Text
          size={TextType.b2}
          fontWeight="600"
          color={Colors.N900}
          style={{ lineHeight: '20px', overflow: 'hidden' }}
        >
          {course.title}
        </Text>

        {/* Description — BodySm muted */}
        {excerpt && (
          <Text size={TextType.b3} color={Colors.TextTertiary}>
            {excerpt}
          </Text>
        )}

        {/* Footer */}
        <view
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingTop: '4px',
          }}
        >
          <Text size={TextType.p} fontWeight="600" color={Colors.Primary}>
            Lihat Selengkapnya
          </Text>
        </view>
      </view>
    </view>
  );
});

export default CourseCard;
