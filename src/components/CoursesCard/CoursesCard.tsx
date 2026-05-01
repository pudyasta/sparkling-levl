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
      className="mb-6 rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm"
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
          <view className="self-start rounded-full bg-blue-50 px-3 py-1">
            <text className="uppercase text-[10px] font-bold tracking-wider text-blue-500">
              {course.level}
            </text>
          </view>
        )}

        {/* Title */}
        <Text size={TextType.b1} fontWeight="bold" className="leading-snug text-slate-800">
          {course.title}
        </Text>

        {/* Description */}
        {course.description && (
          <Text size={TextType.b3} className="leading-relaxed text-slate-400">
            {course.description}
          </Text>
        )}

        {/* Footer meta row */}
        <view className="flex-row items-center pt-1 flex justify-between">
          <view className="flex-row items-center gap-1 flex">
            <text className="text-xs">📚</text>
            <Text size={TextType.b3} className="text-slate-500">
              {course.lessons} lessons
            </Text>
          </view>

          {/* CTA hint */}
          <view className="flex-row items-center gap-1 flex">
            <Text size={TextType.b3} className="font-semibold text-blue-500">
              View Course
            </Text>
          </view>
        </view>
      </view>
    </view>
  );
};
export default CourseCard;
