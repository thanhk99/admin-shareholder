import {
  EditOutlined,
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionOutlined
} from '@ant-design/icons';
import styles from './ResolutionCard.module.css';
import { VotingItem, VotingResult } from '@/app/types/resolution';

interface ResolutionCardProps {
  votingItem: VotingItem;
  result?: VotingResult;
  onViewDetail: (item: VotingItem) => void;
  onEdit: (item: VotingItem) => void;
  onToggleActive: (itemId: string, currentStatus: boolean) => void;
  onVote?: (item: VotingItem) => void;
  meetingStatus?: string;
}

export default function ResolutionCard({
  votingItem,
  result,
  onViewDetail,
  onEdit,
  onToggleActive,
  onVote,
  meetingStatus
}: ResolutionCardProps) {

  const getStats = () => {
    let agree = 0;
    let disagree = 0;
    let noIdea = 0;

    if (result && result.results) {
      result.results.forEach((r: any) => {
        const id = (r.votingOptionId || '').toLowerCase();
        const name = (r.votingOptionName || r.candidateName || '').toLowerCase();

        // Check by ID first (most reliable)
        if (id === 'yes') {
          agree += r.voteCount;
        } else if (id === 'no') {
          disagree += r.voteCount;
        } else if (id === 'not_agree') {
          noIdea += r.voteCount;
        }
        // Fallback to name matching if ID is not standard
        else {
          if (name.includes('không đồng ý') || name.includes('không tán thành') || name.includes('disagree')) {
            disagree += r.voteCount;
          } else if (name.includes('không ý kiến') || name.includes('no opinion') || name.includes('abstain')) {
            noIdea += r.voteCount;
          } else if (name.includes('đồng ý') || name.includes('tán thành') || name.includes('agree')) {
            agree += r.voteCount;
          }
        }
      });
    }
    return { agree, disagree, noIdea, total: result?.totalVoters || 0 };
  };

  const stats = getStats();

  const getStatusInfo = () => {
    const currentTotal = stats.agree + stats.disagree + stats.noIdea;
    const totalVotes = (stats.total > currentTotal) ? stats.total : currentTotal;
    const agreePercentage = totalVotes > 0 ? Math.round((stats.agree / totalVotes) * 100) : 0;

    // Logic mới:
    // 1. Nếu bị khoá (isActive = false)
    if (!votingItem.isActive) {
      return { totalVotes, agreePercentage, isApproved: false, statusLabel: 'ĐÃ KHOÁ', statusClass: styles.locked };
    }

    // 2. Nếu đang biểu quyết (Meeting ONGOING)
    const isOngoing = meetingStatus === 'STARTED' || meetingStatus === 'ONGOING';
    if (isOngoing) {
      return { totalVotes, agreePercentage, isApproved: true, statusLabel: 'ĐANG BIỂU QUYẾT', statusClass: styles.ongoing };
    }

    // 3. Nếu đã kết thúc
    const isApproved = stats.agree > stats.disagree;
    return {
      totalVotes,
      agreePercentage,
      isApproved,
      statusLabel: isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA',
      statusClass: isApproved ? styles.approved : styles.rejected,
    };
  };

  const statusInfo = getStatusInfo();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('vi-VN');
  };

  const handleToggleActive = () => {
    onToggleActive(votingItem.id, votingItem.isActive);
  };

  return (
    <div className={styles.resolutionCard}>
      {/* Header */}
      <div className={styles.resolutionHeader}>
        <div>
          <h3 className={styles.resolutionTitle}>{votingItem.title || 'Không có tiêu đề'}</h3>
        </div>
        <div className={styles.headerRight}>
          <span className={`${styles.status} ${statusInfo.statusClass}`}>
            {statusInfo.statusLabel}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className={styles.description}>{votingItem.description || 'Không có mô tả'}</p>

      {/* Details */}
      <div className={styles.resolutionDetails}>
        <div className={styles.detail}>
          <CalendarOutlined className={styles.detailIcon} />
          <span>Ngày tạo: {formatDate(votingItem.createdAt)}</span>
        </div>
        {votingItem.updatedAt && (
          <div className={styles.detail}>
            <CalendarOutlined className={styles.detailIcon} />
            <span>Cập nhật: {formatDate(votingItem.updatedAt)}</span>
          </div>
        )}
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
              <span className={styles.voteCount}>{stats.agree} phiếu</span>
              <span className={styles.votePercentage}>
                {statusInfo.totalVotes > 0 ? Math.round((stats.agree / statusInfo.totalVotes) * 100) : 0}%
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
              <span className={styles.voteCount}>{stats.disagree} phiếu</span>
              <span className={styles.votePercentage}>
                {statusInfo.totalVotes > 0 ? Math.round((stats.disagree / statusInfo.totalVotes) * 100) : 0}%
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
              <span className={styles.voteCount}>{stats.noIdea} phiếu</span>
              <span className={styles.votePercentage}>
                {statusInfo.totalVotes > 0 ? Math.round((stats.noIdea / statusInfo.totalVotes) * 100) : 0}%
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
          onClick={() => onViewDetail(votingItem)}
        >
          <EyeOutlined />
          Xem
        </button>
        {votingItem.isActive && (
          <button
            className={styles.voteButton}
            onClick={() => onVote?.(votingItem)}
          >
            <CheckOutlined />
            Bỏ phiếu
          </button>
        )}
        <button
          className={styles.editButton}
          onClick={() => onEdit(votingItem)}
        >
          <EditOutlined />
          Sửa
        </button>
      </div>
    </div>
  );
}