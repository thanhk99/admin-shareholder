import { 
  EditOutlined,
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import styles from './ElectionCard.module.css';
import { ElectionSession } from '@/app/types/candidate';

interface ElectionCardProps {
  election: ElectionSession;
  onViewDetail: (election: ElectionSession) => void;
  onManageCandidates: (meetingCode: string) => void;
}

export default function ElectionCard({ 
  election, 
  onViewDetail, 
  onManageCandidates 
}: ElectionCardProps) {
  
  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      upcoming: 'Chờ bắt đầu',
      pending: 'Đang diễn ra',
      completed: 'Đã kết thúc',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      upcoming: '#f39c12',
      pending: '#2ecc71',
      completed: '#95a5a6',
    };
    return colors[status] || '#95a5a6';
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <TrophyOutlined className={styles.goldIcon} />;
      case 2:
        return <TrophyOutlined className={styles.silverIcon} />;
      case 3:
        return <TrophyOutlined className={styles.bronzeIcon} />;
      default:
        return <UserOutlined />;
    }
  };

  const safeToLocaleString = (value: number | undefined | null): string => {
    return value?.toLocaleString() || '0';
  };

  return (
    <div className={styles.electionCard}>
      <div className={styles.electionHeader}>
        <div>
          <h3>{election.title || 'Không có tiêu đề'}</h3>
          <span className={styles.meetingCode}>{election.meetingCode}</span>
        </div>
        <span 
          className={styles.status}
          style={{ backgroundColor: getStatusColor(election.status) }}
        >
          {getStatusLabel(election.status)}
        </span>
      </div>
      
      <p className={styles.description}>{election.description || 'Không có mô tả'}</p>

      <div className={styles.electionDetails}>
        <div className={styles.detail}>
          <CalendarOutlined />
          <span>
            {election.startDate ? new Date(election.startDate).toLocaleDateString('vi-VN') : 'Chưa có ngày'}
          </span>
        </div>
        <div className={styles.detail}>
          <TeamOutlined />
          <span>{election.candidates?.length || 0} ứng viên</span>
        </div>
        <div className={styles.detail}>
          <BarChartOutlined />
          <span>{election.totalVotes || 0} ứng viên tham gia</span>
        </div>
        <div className={styles.detail}>
          <UserOutlined />
          <span>{safeToLocaleString(election.totalShares)} tổng số phiếu</span>
        </div>
      </div>

      {election.status === 'completed' && election.results && election.results.length > 0 && (
        <div className={styles.results}>
          <h4>
            <TrophyOutlined />
            Kết quả bầu cử:
          </h4>
          <div className={styles.candidatesResults}>
            {election.results.slice(0, 3).map((result) => (
              <div key={result.candidateId} className={styles.candidateResult}>
                <div className={styles.candidateRank}>
                  {getPositionIcon(result.position)}
                  <span className={styles.rank}>#{result.position}</span>
                </div>
                <div className={styles.candidateInfo}>
                  <span className={styles.candidateName}>{result.candidateName}</span>
                  <span className={styles.voteInfo}>
                    {result.percentage || 0}% • {safeToLocaleString(result.shares)} phiếu
                  </span>
                </div>
                <div className={styles.votePercentage}>
                  {result.percentage || 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {election.status !== 'completed' && election.candidates && election.candidates.length > 0 && (
        <div className={styles.candidatesPreview}>
          <h4>Danh sách ứng viên:</h4>
          <div className={styles.candidatesList}>
            {election.candidates.slice(0, 3).map((candidate, index) => (
              <div key={candidate.id} className={styles.candidatePreview}>
                <UserOutlined />
                <span>{candidate.candidateName || 'Không có tên'}</span>
                {index === 2 && election.candidates.length > 3 && (
                  <span className={styles.moreCandidates}>
                    +{election.candidates.length - 3} ứng viên khác
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(!election.candidates || election.candidates.length === 0) && (
        <div className={styles.noCandidates}>
          <UserOutlined />
          <span>Chưa có ứng viên nào</span>
        </div>
      )}

      <div className={styles.actions}>
        {election.status === 'completed' && (
          <button 
            className={styles.resultsButton}
            onClick={() => onViewDetail(election)}
          >
            <BarChartOutlined />
            Chi tiết kết quả
          </button>
        )}
        <button 
          className={styles.editButton}
          onClick={() => onManageCandidates(election.meetingCode)}
        >
          <EditOutlined />
          Quản lý ứng viên
        </button>
      </div>
    </div>
  );
}