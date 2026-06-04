import { ScrollView } from '@lynx-js/lynx-ui';
import { useEffect } from '@lynx-js/react';

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
    <view className="h-[100vh] items-center flex justify-center">
      <Loading size={32} />
    </view>
  ) : (
    <>
      <view
        style={{
          background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 100%)',
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        {/* <IconWithBackground image={thropy} /> */}
        <view>
          <Text size={TextType.h1} fontWeight="bold" color="white" fontFamily={FontFamily.jakarta}>
            Kursus Saya
          </Text>
        </view>
      </view>
      <ScrollView scrollOrientation="vertical" className="h-[100vh] w-full pb-24 pt-5">
        <view className="flex-col gap-1 px-4 flex">
          {myCourseData.data.map((item) => (
            <Card
              className="flex-row items-center gap-4 rounded-2xl bg-white p-1 flex shadow-sm"
              bindTap={() =>
                navigateTo('courseDetail', {
                  courseId: item.id,
                  course_slug: item.slug,
                })
              }
            >
              <view className="h-24 w-24 rounded-xl overflow-hidden">
                <CustomImage src={item.thumbnail || ''} className="h-full w-full" />
              </view>
              <view className="flex-1 flex-col gap-1 flex">
                <Text size={TextType.b1} fontWeight="bold" className="text-slate-800">
                  {item.title || ''}
                </Text>
                <Text size={TextType.b3} color={Colors.Primary}>
                  {item.progress.completed_items} dari {item.progress.total_items} materi
                </Text>
                <view className="mt-1 flex-row items-center gap-2 flex">
                  <view className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <view
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: Colors.Primary,
                        width: `${item.progress.percentage}%`,
                      }}
                    />
                  </view>
                  <Text size={TextType.b3} className="text-slate-400">
                    {item.progress.percentage}%
                  </Text>
                </view>
              </view>
            </Card>
          ))}
        </view>
      </ScrollView>
    </>
  );
};
export default MyCourse;
