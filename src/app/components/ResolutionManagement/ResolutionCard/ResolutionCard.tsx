import { 
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CalendarOutlined,
  UserOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionOutlined
} from '@ant-design/icons';
import styles from './ResolutionCard.module.css';
import { Resolution } from '@/app/types/resolution';

interface ResolutionCardProps {
  resolution: Resolution;
  onViewDetail: (resolution: Resolution) => void;
  onEdit: (resolution: Resolution) => void;
  onToggleActive: (resolutionId: string, currentStatus: boolean) => void;
}

export default function ResolutionCard({ 
  resolution, 
  onViewDetail, 
  onEdit,
  onToggleActive 
}: ResolutionCardProps) {
  
  const getStatusInfo = () => {
    const totalVotes = resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea;
    const agreePercentage = totalVotes > 0 ? Math.round((resolution.totalAgree / totalVotes) * 100) : 0;
    const isApproved = resolution.totalAgree > resolution.totalNotAgree;
    
    return {
      totalVotes,
      agreePercentage,
      isApproved,
      statusLabel: isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA',
    };
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const handleToggleActive = () => {
    onToggleActive(resolution.id, resolution.isActive);
  };

  return (
    <div className={`${styles.resolutionCard} ${!resolution.isActive ? styles.inactive : ''}`}>
      {/* Header */}
      <div className={styles.resolutionHeader}>
        <div>
          <h3 className={styles.resolutionTitle}>{resolution.title || 'Không có tiêu đề'}</h3>
          <span className={styles.resolutionCode}>{resolution.resolutionCode}</span>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.status} ${statusInfo.isApproved ? styles.approved : styles.rejected}`}>
            {statusInfo.statusLabel}
          </span>
          {!resolution.isActive && (
            <span className={styles.inactiveBadge}>
              ĐÃ KHOÁ
            </span>
          )}
        </div>
      </div>
      
      {/* Description */}
      <p className={styles.description}>{resolution.description || 'Không có mô tả'}</p>

      {/* Details */}
      <div className={styles.resolutionDetails}>
        <div className={styles.detail}>
          <CalendarOutlined className={styles.detailIcon} />
          <span>Ngày tạo: {formatDate(resolution.createdAt)}</span>
        </div>
        <div className={styles.detail}>
          <UserOutlined className={styles.detailIcon} />
          <span>Người tạo: {resolution.createBy}</span>
        </div>
      </div>

      {/* Voting Results */}
      <div className={styles.results}>
        <h4 className={styles.resultsTitle}>
          <CheckOutlined className={styles.resultsIcon} />
          Kết quả biểu quyết:
        </h4>
        <div className={styles.votingResults}>
          {/* Agree Votes */}
          <div className={`${styles.voteItem} ${styles.voteAgree}`}>
            <div className={styles.voteType}>
              <CheckOutlined className={styles.voteTypeIcon} />
              <span>Đồng ý</span>
            </div>
            <div className={styles.voteStats}>
              <span className={styles.voteCount}>{resolution.totalAgree} phiếu</span>
              <span className={styles.votePercentage}>
                {statusInfo.totalVotes > 0 ? Math.round((resolution.totalAgree / statusInfo.totalVotes) * 100) : 0}%
              </span>
            </div>
          </div>
          
          {/* Disagree Votes */}
          <div className={`${styles.voteItem} ${styles.voteDisagree}`}>
            <div className={styles.voteType}>
              <CloseOutlined className={styles.voteTypeIcon} />
              <span>Không đồng ý</span>
            </div>
            <div className={styles.voteStats}>
              <span className={styles.voteCount}>{resolution.totalNotAgree} phiếu</span>
              <span className={styles.votePercentage}>
                {statusInfo.totalVotes > 0 ? Math.round((resolution.totalNotAgree / statusInfo.totalVotes) * 100) : 0}%
              </span>
            </div>
          </div>
          
          {/* No Idea Votes */}
          <div className={`${styles.voteItem} ${styles.voteNoIdea}`}>
            <div className={styles.voteType}>
              <QuestionOutlined className={styles.voteTypeIcon} />
              <span>Không ý kiến</span>
            </div>
            <div className={styles.voteStats}>
              <span className={styles.voteCount}>{resolution.totalNotIdea} phiếu</span>
              <span className={styles.votePercentage}>
                {statusInfo.totalVotes > 0 ? Math.round((resolution.totalNotIdea / statusInfo.totalVotes) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${statusInfo.agreePercentage}%` }}
            />
          </div>
          <div className={styles.progressText}>
            Tỷ lệ đồng ý: <strong>{statusInfo.agreePercentage}%</strong>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button 
          className={styles.viewButton}
          onClick={() => onViewDetail(resolution)}
        >
          <EyeOutlined />
          Xem
        </button>
        <button 
          className={styles.editButton}
          onClick={() => onEdit(resolution)}
          disabled={!resolution.isActive}
        >
          <EditOutlined />
          Sửa
        </button>
        <button 
          className={`${styles.toggleButton} ${!resolution.isActive ? styles.unlock : ''}`}
          onClick={handleToggleActive}
        >
          {resolution.isActive ? <LockOutlined /> : <UnlockOutlined />}
          {resolution.isActive ? 'Khoá' : 'Mở khoá'}
        </button>
      </div>
    </div>
  );
}