import { VotingSession } from '@/app/types/voting';
import styles from './VotingStats.module.css';

interface VotingStatsProps {
  votingSessions: VotingSession[];
}

export default function VotingStats({ votingSessions }: VotingStatsProps) {
  const stats = {
    total: votingSessions.length,
    upcoming: votingSessions.filter(v => v.status === 'upcoming').length,
    ongoing: votingSessions.filter(v => v.status === 'ongoing').length,
    completed: votingSessions.filter(v => v.status === 'completed').length,
  };

  return (
    <div className={styles.stats}>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.total}</span>
        <span className={styles.statLabel}>Tổng số</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.upcoming}</span>
        <span className={styles.statLabel}>Sắp diễn ra</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.ongoing}</span>
        <span className={styles.statLabel}>Đang diễn ra</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{stats.completed}</span>
        <span className={styles.statLabel}>Đã kết thúc</span>
      </div>
    </div>
  );
}