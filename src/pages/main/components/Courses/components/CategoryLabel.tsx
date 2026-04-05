import { Colors } from '../../../../../constant/style';

interface LabelProps {
  isActive: boolean;
  bindTap: (e: any) => void;
  category: string;
}
const CategoryLabel: React.FC<LabelProps> = ({
  isActive,
  category,
  bindTap,
}) => {
  return (
    <view
      className={`px-3 py-1.5 rounded-full border`}
      style={{
        backgroundColor: isActive ? Colors.Primary : Colors.Background,
        borderColor: isActive ? Colors.Primary : Colors.Background,
      }}
      bindtap={bindTap}
    >
      <text
        className={
          isActive
            ? 'text-white text-sm font-semibold'
            : 'text-gray-700 text-sm'
        }
      >
        {category}
      </text>
    </view>
  );
};
export default CategoryLabel;
