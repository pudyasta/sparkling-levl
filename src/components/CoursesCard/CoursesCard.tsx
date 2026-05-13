import { Colors } from '@/constant/style';
import { htmlToPlainText } from '@/lib/helper/htmlToLynx';

import Text from '../Text';
import { TextType } from '../Text/types';
import Card from '../common/Card/Card';
import style from './CourseCard.module.css';

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

const CourseCard: React.FC<CourseCardProps> = ({ course, bindTap }) => {
  return (
    <view
      bindtap={bindTap}
      className="mb-6 rounded-2xl border border-light bg-surface overflow-hidden shadow-sm"
    >
      {/* Thumbnail — full width hero */}
      {course.image && (
        <view
          style={{ backgroundImage: `url(${course.image})` }}
          className="h-36 w-full bg-cover bg-center"
        />
      )}

      {/* Content */}
      <view className="flex-col gap-3 p-4 flex">
        {/* Level badge */}
        {course.level && (
          <view className="self-start rounded-full bg-accent px-3 py-1">
            <Text size={TextType.b3} fontWeight="bold" color={Colors.Primary}>
              {course.level.toUpperCase()}
            </Text>
          </view>
        )}

        {/* Title */}
        <Text size={TextType.b1} fontWeight="bold" className="leading-snug text-neutral">
          {course.title}
        </Text>

        {/* Description */}
        {course.description && (
          <Text size={TextType.b3} className="leading-relaxed text-subtle">
            {htmlToPlainText(course.description).split(' ').slice(0, 35).join(' ') + '...'}
          </Text>
        )}

        {/* Footer meta row */}
        <view className="flex-row items-center pt-1 flex justify-end">
          <view className="flex-row items-center gap-1 flex">
            <Text size={TextType.b3} color={Colors.Primary}>
              Lihat Seleengkapnya
            </Text>
          </view>
        </view>
      </view>
    </view>
  );
};
export default CourseCard;
