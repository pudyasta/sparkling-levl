import Shimmer from '@/components/common/Shimmer/Shimmer';
import styles from './Leaderboard.module.css';
import itemStyles from './LeaderboardItem/Leaderboarditem.module.css';
import Card from '@/components/common/Card/Card';
interface LeaderboardLoaderProps {}
const LeaderboardLoader: React.FC<LeaderboardLoaderProps> = ({}) => {
  return (
    <>
      <view
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingTop: '12px',
          borderBottomWidth: '1px',
          borderBottomColor: '#eeeeee',
          display: 'flex',
        }}
      >
        <view className={styles.lbRow}>
          {Array.from({ length: 3 }).map((_, idx: number) => (
            <view key={idx} className={`${styles.lbCard}`}>
              <Shimmer className={styles.lbAvatar} isRound={true} />
              <Shimmer className={styles.lbInfo} />
            </view>
          ))}
        </view>
      </view>

      {/* Full list */}
      <view
        style={{
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Array.from({ length: 3 }).map((_, idx: number) => (
          <Card className={itemStyles.card}>
            <Shimmer className={itemStyles.rankCircle} isRound={true} />
            <Shimmer className={itemStyles.avatarCircle} isRound={true} />
            <Shimmer className={itemStyles.info} />
          </Card>
        ))}
      </view>
    </>
  );
};
export default LeaderboardLoader;
