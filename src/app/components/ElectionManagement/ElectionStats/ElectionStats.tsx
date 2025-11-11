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
      <span>Tổng: {stats.total} cuộc bầu cử</span>
      <span>•</span>
      <span>Chờ bắt đầu: {stats.upcoming}</span>
      <span>•</span>
      <span>Đang diễn ra: {stats.pending}</span>
      <span>•</span>
      <span>Đã kết thúc: {stats.completed}</span>
    </div>
  );
}