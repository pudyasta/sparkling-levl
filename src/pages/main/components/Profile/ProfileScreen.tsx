import { ScrollView } from '@lynx-js/lynx-ui';
import { type FC } from '@lynx-js/react';

import {
  courses,
  date,
  documentLock,
  editIcon,
  manageAccount,
  privacy,
  time,
  xp,
} from '@/assets/images/icon';
import { Loading } from '@/components/Loading/Loading';
import { PullToRefresh } from '@/components/PullToRefresh/PullToRefresh';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Card from '@/components/common/Card/Card';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useGetProfile } from '@/pages/Profile/usecase/useGetProfile';

import { useGetAchievements, useGetGamificationStats } from '../../usecase/useGetProfile';
import styles from './Profile.module.css';
import AchievementItem from './components/Achievements';
import { ProfileHeader } from './components/ProfileHeader';
import StatsCard from './components/StatsCard';

export const ProfileScreen: FC = () => {
  const { navigateTo } = useNativeBridge();
  const { stats, isLoading, refetch: refetchGami } = useGetGamificationStats();
  const {
    achievements,
    isLoading: isLoadingAchievements,
    refetch: refetchAchievements,
  } = useGetAchievements();
  const { profile, refetch: refetchProfile, isLoading: profileLoading } = useGetProfile();

  if (isLoading || isLoadingAchievements || profileLoading) {
    return (
      <view className="h-[100vh] items-center flex justify-center">
        <Loading size={32} />
      </view>
    );
  }

  const refetchAll = () => {
    refetchProfile();
    refetchAchievements();
    refetchGami();
  };

  return (
    <PullToRefresh onRefresh={async () => refetchAll()}>
      {(scrollProps) => (
        <ScrollView
          className={`${styles.container} h-[100vh] animate-fade-in`}
          onScrollToUpper={scrollProps.bindscrolltoupper}
          onScroll={scrollProps.bindscroll}
        >
          <ProfileHeader
            name={profile?.name || ''}
            email={profile?.email || ''}
            streak={stats.activity.current_streak}
            bio={profile?.bio || ''}
            initials={
              profile?.name
                .split(' ')
                .map((n) => n[0].toUpperCase())
                .join('') || ''
            }
            level={12}
            currentXP={870}
            nextLevelXP={1740}
            avatarUrl={profile?.avatar_url || ''}
          />

          <view className={styles.content}>
            {/* Progress Section */}
            <Card className={styles.progressCard}>
              <view className={styles.progressTop}>
                <view className={styles.progressInfo}>
                  <Text size={TextType.h2} fontWeight="bold" fontFamily={FontFamily.jakarta}>
                    {stats.level.name}
                  </Text>
                  <Text size={TextType.b3}>
                    {stats.level.xp_to_next_level} XP untuk Level {stats.level.current + 1}
                  </Text>
                </view>
                <view className={styles.levelBadge}>
                  <Text className={styles.levelBadgeText} color="white">
                    {stats.level.current}
                  </Text>
                </view>
              </view>
              <view className={styles.progressBarBg}>
                <view
                  className={styles.progressBarFill}
                  style={{ width: `${stats.level.progress_percentage}%` }}
                />
              </view>
            </Card>

            {/* Stats Grid */}
            <view className={styles.statsGrid}>
              <StatsCard label="Total XP" value={stats.xp.total} iconUrl={xp} />
              <StatsCard
                label="Total Kursus"
                value={stats.activity.total_course_enrolled}
                iconUrl={courses}
              />
              <StatsCard label="Total Jam Belajar" value={stats.xp.period} iconUrl={time} />
              <StatsCard
                label="Streak Terpanjang"
                value={stats.activity.longest_streak}
                iconUrl={date}
              />
            </view>

            {/* Achievements */}
            {achievements?.length > 0 && (
              <view className={styles.sectionHeader}>
                <Text size={TextType.h2} fontWeight="bold" fontFamily={FontFamily.jakarta}>
                  Pencapaian
                </Text>
              </view>
            )}
            <view className={styles.achievementRow}>
              {achievements.map((achievement, index) => {
                if (index < 9) {
                  return (
                    <AchievementItem
                      key={achievement.id}
                      title={achievement.name}
                      iconUrl={achievement?.icon_url || ''}
                      color={'blue'}
                      isActive={true}
                    />
                  );
                }
                return null;
              })}
            </view>

            {/* Settings Menu */}
            <view>
              <Text size={TextType.h2} fontWeight="bold" fontFamily={FontFamily.jakarta}>
                Pengaturan Akun
              </Text>
              <view className="my-4 rounded-2xl bg-white overflow-hidden">
                {[
                  {
                    emoji: editIcon,
                    label: 'Edit Profil',
                    description: 'Ubah informasi profil Kamu',
                    screen: 'profile',
                  },
                  // {
                  //   emoji: documentLock,
                  //   label: 'Keamanan Akun',
                  //   description: 'Ubah password dan email Kamu',
                  //   screen: 'security',
                  // },
                  // {
                  //   emoji: privacy,
                  //   label: 'Privasi',
                  //   description: 'Atur privasi Kamu',
                  //   screen: 'privacy',
                  // },
                  {
                    emoji: manageAccount,
                    label: 'Akun',
                    description: 'Logout atau hapus akun Kamu',
                    screen: 'danger',
                  },
                ].map((item, idx, arr) => (
                  <view
                    key={item.screen}
                    bindtap={() => navigateTo('profile', { screen: item.screen })}
                    className={`flex-row items-center gap-4 bg-white px-5 py-4 flex ${idx < arr.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <view className="h-10 w-10 items-center rounded-full bg-slate-100 p-2 justify-center">
                      <CustomImage src={item.emoji} className="h-full w-full" />
                    </view>
                    <view className="flex-1 flex-col flex">
                      <Text size={TextType.b1}>{item.label}</Text>
                      <Text size={TextType.p}>{item.description}</Text>
                    </view>
                  </view>
                ))}
              </view>
            </view>
          </view>
        </ScrollView>
      )}
    </PullToRefresh>
  );
};
