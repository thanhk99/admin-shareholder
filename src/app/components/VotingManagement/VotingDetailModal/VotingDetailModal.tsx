import { CloseOutlined, CalendarOutlined, UserOutlined, BarChartOutlined } from '@ant-design/icons';
import styles from './VotingDetailModal.module.css';
import { VotingSession } from '@/app/types/voting';

interface VotingDetailModalProps {
  isOpen: boolean;
  voting: VotingSession | null;
  onClose: () => void;
}

export default function VotingDetailModal({ isOpen, voting, onClose }: VotingDetailModalProps) {
  if (!isOpen || !voting) return null;

  const getStatusInfo = (status: string) => {
    const statusMap = {
      upcoming: { label: 'Sắp diễn ra', color: '#f39c12' },
      ongoing: { label: 'Đang diễn ra', color: '#27ae60' },
      completed: { label: 'Đã kết thúc', color: '#7f8c8d' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.upcoming;
  };

  const statusInfo = getStatusInfo(voting.status);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Chi tiết Biểu quyết</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <CloseOutlined />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h3>Thông tin cơ bản</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Mã biểu quyết:</span>
                <span className={styles.infoValue}>{voting.votingCode}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Trạng thái:</span>
                <span 
                  className={styles.status}
                  style={{ color: statusInfo.color }}
                >
                  {statusInfo.label}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Ngày tạo:</span>
                <span className={styles.infoValue}>
                  {new Date(voting.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.section}>
            <h3>Thời gian biểu quyết</h3>
            <div className={styles.timeline}>
              <div className={styles.timelineItem}>
                <CalendarOutlined />
                <div>
                  <div className={styles.timelineLabel}>Bắt đầu</div>
                  <div className={styles.timelineValue}>
                    {new Date(voting.startDate).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
              <div className={styles.timelineItem}>
                <CalendarOutlined />
                <div>
                  <div className={styles.timelineLabel}>Kết thúc</div>
                  <div className={styles.timelineValue}>
                    {new Date(voting.endDate).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className={styles.section}>
            <h3>Thống kê</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <UserOutlined className={styles.statIcon} />
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{voting.totalVoters}</div>
                  <div className={styles.statLabel}>Người tham gia</div>
                </div>
              </div>
              <div className={styles.statItem}>
                <BarChartOutlined className={styles.statIcon} />
                <div className={styles.statContent}>
                  <div className={styles.statValue}>{voting.totalVotes}</div>
                  <div className={styles.statLabel}>Tổng lượt bầu</div>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {voting.status === 'completed' && voting.results && voting.results.length > 0 && (
            <div className={styles.section}>
              <h3>Kết quả biểu quyết</h3>
              <div className={styles.results}>
                {voting.results.map((result, index) => (
                  <div key={result.optionId} className={styles.resultItem}>
                    <div className={styles.resultRank}>#{index + 1}</div>
                    <div className={styles.resultContent}>
                      <div className={styles.resultHeader}>
                        <span className={styles.optionName}>{result.optionName}</span>
                        <span className={styles.voteCount}>{result.votes} phiếu</span>
                      </div>
                      <div className={styles.resultBar}>
                        <div 
                          className={styles.resultFill}
                          style={{ width: `${result.percentage}%` }}
                        />
                      </div>
                      <div className={styles.resultPercentage}>{result.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          {voting.options && voting.options.length > 0 && (
            <div className={styles.section}>
              <h3>Lựa chọn biểu quyết</h3>
              <div className={styles.optionsList}>
                {voting.options.map((option, index) => (
                  <div key={option.id} className={styles.optionItem}>
                    <span className={styles.optionNumber}>{index + 1}</span>
                    <span className={styles.optionText}>{option.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.closeActionButton}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}