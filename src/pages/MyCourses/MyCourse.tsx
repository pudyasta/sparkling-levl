import { useEffect } from 'react';

import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Card from '@/components/common/Card/Card';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import { useGetMyCourse } from './usecase/useGetMyCourse';

const MyCourse: React.FC = () => {
  const { data: myCourseData, isLoading } = useGetMyCourse();
  const { navigateTo } = useNativeBridge();

  if (!myCourseData) {
    return null;
  }

  return isLoading ? (
    <view className="h-full items-center flex justify-center">
      <Loading size={32} />
    </view>
  ) : (
    <>
      <view className="bg-gradient-primary items-center gap-4 px-6 py-7 flex">
        {/* <IconWithBackground image={thropy} /> */}
        <view>
          <Text size={TextType.h1} fontWeight="bold" color="white" fontFamily={FontFamily.jakarta}>
            Kursus Saya
          </Text>
        </view>
      </view>
      <scroll-view scroll-y className="h-full w-full animate-fade-in pt-5">
        <view className="flex-col gap-1 px-4 flex">
          {myCourseData.data.map((item) => (
            <Card
              className="flex-row items-center gap-2 rounded-2xl bg-surface p-4 flex shadow-sm"
              bindTap={() =>
                navigateTo('courseDetail', {
                  courseId: item.id,
                  course_slug: item.slug,
                })
              }
            >
              <view className="h-20 w-20 rounded-xl overflow-hidden">
                <CustomImage src={item.thumbnail} className="h-full w-full" />
              </view>
              <view className="flex-1 flex-col gap-1 flex">
                <Text size={TextType.b1} fontWeight="bold" className="text-neutral">
                  {item.title || ''}
                </Text>
                <Text size={TextType.b3} color={Colors.Primary}>
                  {item.progress.completed_items} of {item.progress.total_items} items
                </Text>
                <view className="mt-1 flex-row items-center gap-2 flex">
                  <view className="h-2 flex-1 rounded-full bg-surface-alt overflow-hidden">
                    <view
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: Colors.Primary,
                        width: `${item.progress.percentage}%`,
                      }}
                    />
                  </view>
                  <Text size={TextType.b3} className="text-subtle">
                    {item.progress.percentage}%
                  </Text>
                </view>
              </view>
            </Card>
          ))}
        </view>
      </scroll-view>
    </>
  );
};
export default MyCourse;
