import { type FC, useEffect } from '@lynx-js/react';

import { courses, date, time, xp } from '@/assets/images/icon';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card/Card';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import { useGetAchievements, useGetGamificationStats } from '../../usecase/useGetProfile';
import styles from './Profile.module.css';
import AchievementItem from './components/Achievements';
import { ProfileHeader } from './components/ProfileHeader';
import StatsCard from './components/StatsCard';

export const ProfileScreen: FC = () => {
  const { user, logout } = useNativeBridge();
  const { stats, isLoading } = useGetGamificationStats();
  const { achievements, isLoading: isLoadingAchievements } = useGetAchievements();

  if (isLoading || isLoadingAchievements) {
    return (
      <view className="h-full items-center flex justify-center">
        <Loading size={32} />
      </view>
    );
  }

  useEffect(() => {}, [stats, achievements]);

  return (
    <scroll-view className={`${styles.container} animate-fade-in`}>
      <ProfileHeader
        name={user?.name || ''}
        email={user?.email || ''}
        streak={stats.activity.current_streak}
        initials={
          user?.name
            .split(' ')
            .map((n) => n[0])
            .join('') || ''
        }
        level={12}
        currentXP={870}
        nextLevelXP={1740}
        avatarUrl={user?.avatar_url || ''}
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
            <Text>Lihat Semua</Text>
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
      </view>
    </scroll-view>
  );
};
