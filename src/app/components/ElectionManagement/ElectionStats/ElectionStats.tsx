import { ElectionSession } from '@/app/types/candidate';
import styles from './ElectionStats.module.css';

interface ElectionStatsProps {
  electionSessions: ElectionSession[];
}

export default function ElectionStats({ electionSessions }: ElectionStatsProps) {
  const getElectionStats = () => {
    const total = electionSessions.length;
    const upcoming = electionSessions.filter(v => v.status === 'upcoming').length;
    const pending = electionSessions.filter(v => v.status === 'pending').length;
    const completed = electionSessions.filter(v => v.status === 'completed').length;
    
    return { total, upcoming, pending, completed };
  };

  const stats = getElectionStats();

  return (
    <div className={styles.stats}>
      {/* Cuộc họp - Blue gradient */}
      <div className={`${styles.statItem} ${styles.meetingGradient}`}>
        <span className={styles.statNumber}>{stats.total}</span>
        <span className={styles.statLabel}>Cuộc họp</span>
      </div>

      {/* Chờ bắt đầu - Orange gradient */}
      <div className={`${styles.statItem} ${styles.upcomingGradient}`}>
        <span className={styles.statNumber}>{stats.upcoming}</span>
        <span className={styles.statLabel}>Chờ bắt đầu</span>
      </div>

      {/* Đang diễn ra - Red gradient */}
      <div className={`${styles.statItem} ${styles.pendingGradient}`}>
        <span className={styles.statNumber}>{stats.pending}</span>
        <span className={styles.statLabel}>Đang diễn ra</span>
      </div>

      {/* Đã kết thúc - Purple gradient */}
      <div className={`${styles.statItem} ${styles.completedGradient}`}>
        <span className={styles.statNumber}>{stats.completed}</span>
        <span className={styles.statLabel}>Đã kết thúc</span>
      </div>
    </div>
  );
}