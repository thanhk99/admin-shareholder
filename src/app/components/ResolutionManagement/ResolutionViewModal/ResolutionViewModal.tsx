import { Modal, Tag } from 'antd';
import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  QuestionOutlined,
  UserOutlined
} from '@ant-design/icons';
import styles from './ResolutionViewModal.module.css';
import { VotingItem, VotingResult } from '@/app/types/resolution';

interface ResolutionViewModalProps {
  isOpen: boolean;
  votingItem: VotingItem | null;
  result?: VotingResult;
  meetingStatus?: string;
  onClose: () => void;
}

export default function ResolutionViewModal({
  isOpen,
  votingItem,
  result,
  meetingStatus,
  onClose
}: ResolutionViewModalProps) {

  if (!votingItem) return null;

  const getStats = () => {
    let agree = 0;
    let disagree = 0;
    let noIdea = 0;

    if (result && result.results) {
      result.results.forEach((r: any) => {
        // Find option type
        const option = votingItem.votingOptions?.find(opt => opt.id === r.votingOptionId);

        if (option?.type === 'AGREE') {
          agree += r.voteCount;
        } else if (option?.type === 'DISAGREE') {
          disagree += r.voteCount;
        } else if (option?.type === 'NO_IDEA') {
          noIdea += r.voteCount;
        } else {
          // Fallback
          const id = (r.votingOptionId || '').toLowerCase();
          if (id === 'yes') agree += r.voteCount;
          else if (id === 'no') disagree += r.voteCount;
          else if (id === 'not_agree') noIdea += r.voteCount;
        }
      });
    }
    return { agree, disagree, noIdea, total: result?.totalVoters || 0 };
  };

  const stats = getStats();
  const currentTotal = stats.agree + stats.disagree + stats.noIdea;
  const totalVotes = stats.total > currentTotal ? stats.total : currentTotal;
  const agreePercentage = totalVotes > 0 ? Math.round((stats.agree / totalVotes) * 100) : 0;

  const getStatusDisplay = () => {
    const isOngoing = meetingStatus === 'STARTED' || meetingStatus === 'ONGOING';
    if (isOngoing) {
      return { label: 'ĐANG BIỂU QUYẾT', className: styles.ongoing };
    }
    const isApproved = stats.agree > stats.disagree;
    return {
      label: isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA',
      className: isApproved ? styles.approved : styles.rejected
    };
  };

  const statusDisplay = getStatusDisplay();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString('vi-VN');
  };

  return (
    <Modal
      title="Chi tiết Nội dung"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <button key="close" className={styles.closeButton} onClick={onClose}>
          Đóng
        </button>
      ]}
      width={600}
      centered={true}
      style={{ top: 20 }}
    >
      <div className={styles.modalContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mã (ID):</span>
              <span className={styles.infoValue}>{votingItem.id}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tiêu đề:</span>
              <span className={styles.infoValue}>{votingItem.title}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thời gian bắt đầu:</span>
              <span className={styles.infoValue}>{formatDate(votingItem.startTime)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Thời gian kết thúc:</span>
              <span className={styles.infoValue}>{formatDate(votingItem.endTime)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mô tả:</span>
              <span className={styles.infoValue}>{votingItem.description}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Số lượng lựa chọn tối đa:</span>
              <span className={styles.infoValue}>{votingItem.maxSelections}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Trạng thái:</span>
              <span className={`${styles.status} ${statusDisplay.className}`}>
                {statusDisplay.label}
              </span>
            </div>
          </div>
        </div>

        {votingItem.votingOptions && votingItem.votingOptions.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Các lựa chọn biểu quyết</h3>
            <div className={styles.optionsList}>
              {votingItem.votingOptions.map((option, index) => (
                <div key={option.id} className={styles.optionItem}>
                  <div className={styles.optionIndex}>{index + 1}</div>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionName}>
                      {option.name}
                      {option.type === 'AGREE' && <span className={styles.tagAgree}>(Đồng ý)</span>}
                      {option.type === 'DISAGREE' && <span className={styles.tagDisagree}>(Không đồng ý)</span>}
                      {option.type === 'NO_IDEA' && <span className={styles.tagNoIdea}>(Không ý kiến)</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Votes Section */}
        {votingItem.userVotes && votingItem.userVotes.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Phiếu bầu của bạn</h3>
            <div className={styles.optionsList}>
              {votingItem.userVotes.map((vote, index) => (
                <div key={index} className={styles.optionItem}>
                  <div className={styles.optionInfo}>
                    <div className={styles.optionName}>
                      {vote.votingOptionName}
                      <span className={styles.voteWeightTag}>
                        {vote.voteWeight.toLocaleString()} quyền
                      </span>
                    </div>
                    <div className={styles.voteTime}>
                      <CalendarOutlined style={{ marginRight: 4 }} />
                      {formatDate(vote.votedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin tạo</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><CalendarOutlined /> Ngày tạo:</span>
              <span className={styles.infoValue}>{formatDate(votingItem.createdAt)}</span>
            </div>
            {votingItem.updatedAt && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}><CalendarOutlined /> Cập nhật lần cuối:</span>
                <span className={styles.infoValue}>{formatDate(votingItem.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Kết quả biểu quyết</h3>
          <div className={styles.votingResults}>
            <div className={styles.voteItem}>
              <div className={styles.voteType}>
                <CheckOutlined className={styles.agreeIcon} />
                <span>Đồng ý</span>
              </div>
              <div className={styles.voteStats}>
                <span className={styles.voteCount}>{stats.agree} phiếu</span>
                <span className={styles.votePercentage}>
                  {totalVotes > 0 ? Math.round((stats.agree / totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className={styles.voteItem}>
              <div className={styles.voteType}>
                <CloseOutlined className={styles.disagreeIcon} />
                <span>Không đồng ý</span>
              </div>
              <div className={styles.voteStats}>
                <span className={styles.voteCount}>{stats.disagree} phiếu</span>
                <span className={styles.votePercentage}>
                  {totalVotes > 0 ? Math.round((stats.disagree / totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className={styles.voteItem}>
              <div className={styles.voteType}>
                <QuestionOutlined className={styles.abstainIcon} />
                <span>Không ý kiến</span>
              </div>
              <div className={styles.voteStats}>
                <span className={styles.voteCount}>{stats.noIdea} phiếu</span>
                <span className={styles.votePercentage}>
                  {totalVotes > 0 ? Math.round((stats.noIdea / totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className={styles.progressSection}>
            <div className={styles.progressInfo}>
              <span>Tổng số phiếu: <strong>{totalVotes}</strong></span>
              <span>Tỷ lệ đồng ý: <strong>{agreePercentage}%</strong></span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${agreePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}