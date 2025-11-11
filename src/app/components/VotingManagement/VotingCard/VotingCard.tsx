import { 
  EyeOutlined, 
  CalendarOutlined, 
  UserOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import styles from './VotingCard.module.css';
import { VotingSession } from '@/app/types/voting';

interface VotingCardProps {
  voting: VotingSession;
  onViewDetail: (voting: VotingSession) => void;
}

export default function VotingCard({ voting, onViewDetail }: VotingCardProps) {
  
  const getStatusInfo = (status: string) => {
    const statusMap: any = {
      upcoming: { label: 'Sắp diễn ra', color: '#666' },
      ongoing: { label: 'Đang diễn ra', color: '#000' },
      completed: { label: 'Đã kết thúc', color: '#333' }
    };
    return statusMap[status] || statusMap.upcoming;
  };

  const statusInfo = getStatusInfo(voting.status);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3>{voting.title}</h3>
          <span className={styles.votingCode}>{voting.votingCode}</span>
        </div>
        <span 
          className={styles.status}
          style={{ color: statusInfo.color, borderColor: statusInfo.color }}
        >
          {statusInfo.label}
        </span>
      </div>
      
      <p className={styles.description}>{voting.description}</p>

      <div className={styles.details}>
        <div className={styles.detail}>
          <CalendarOutlined />
          <span>Bắt đầu: {new Date(voting.startDate).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className={styles.detail}>
          <CalendarOutlined />
          <span>Kết thúc: {new Date(voting.endDate).toLocaleDateString('vi-VN')}</span>
        </div>
        <div className={styles.detail}>
          <UserOutlined />
          <span>{voting.totalVoters} người tham gia</span>
        </div>
        <div className={styles.detail}>
          <BarChartOutlined />
          <span>{voting.totalVotes} lượt bầu</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.viewButton}
          onClick={() => onViewDetail(voting)}
        >
          <EyeOutlined />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}