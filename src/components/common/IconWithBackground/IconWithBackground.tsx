import CustomImage from '../CustomImage/CustomImage';
import style from './IconWithBackground.module.css';

interface IconWithBackgroundProps {
  image: string;
}
const IconWithBackground: React.FC<IconWithBackgroundProps> = ({ image }) => {
  return (
    <view className={style.logo}>
      <CustomImage src={image} style={{ width: '32px', height: '32px' }} />
    </view>
  );
};
export default IconWithBackground;
