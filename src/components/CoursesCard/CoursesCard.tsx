import { useState } from '@lynx-js/react';
import Card from '../common/Card';
import Text from '../Text';
import { TextType } from '../Text/types';
import style from './CourseCard.module.css';
import { dummy } from '@/assets/images/icon';

interface CourseCardProps {
  title: string;
  difficulty: string;
  desc: string;
  image: string;
  bindTap: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  difficulty,
  desc,
  image,
  bindTap,
}) => {
  return (
    <Card className={style.recommendedCard} bindTap={bindTap}>
      <view className={style.titleWrapper}>
        <image src={image} className={style.courseThumbnail} />
        <view className={style.titleName}>
          <Text size={TextType.b1} bold>
            {title}
          </Text>
        </view>
      </view>

      <Text size={TextType.b3}>{desc}</Text>

      <Text size={TextType.b3} bold>
        🏷 {difficulty}
      </Text>
    </Card>
  );
};
export default CourseCard;
