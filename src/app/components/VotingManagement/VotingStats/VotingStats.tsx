import styles from './VotingStats.module.css';

interface VotingStatsProps {
  totalMeetings: number;
  totalResolutions: number;
  totalVotes: number;
  approvedResolutions: number;
}

export default function VotingStats({ 
  totalMeetings, 
  totalResolutions, 
  totalVotes, 
  approvedResolutions 
}: VotingStatsProps) {
  const approvalRate = totalResolutions > 0 ? Math.round((approvedResolutions / totalResolutions) * 100) : 0;

  return (
    <div className={styles.stats}>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{totalMeetings}</span>
        <span className={styles.statLabel}>Cuộc họp</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{totalResolutions}</span>
        <span className={styles.statLabel}>Nghị quyết</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{totalVotes.toLocaleString()}</span>
        <span className={styles.statLabel}>Lượt bỏ phiếu</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNumber}>{approvalRate}%</span>
        <span className={styles.statLabel}>Tỷ lệ thông qua</span>
      </div>
    </div>
  );
}