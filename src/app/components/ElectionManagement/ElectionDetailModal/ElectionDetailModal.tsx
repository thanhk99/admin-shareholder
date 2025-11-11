'use client';

import { Modal, Progress } from 'antd';
import { 
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
  UserOutlined,
  TrophyOutlined,
  CloseOutlined,
  CrownOutlined,
  CheckOutlined,
  CloseOutlined as CloseIcon
} from '@ant-design/icons';
import styles from './ElectionDetailModal.module.css';
import { ElectionSession } from '@/app/types/candidate';

interface ElectionDetailModalProps {
  isOpen: boolean;
  election: ElectionSession | null;
  onClose: () => void;
  onManageCandidates: (meetingCode: string) => void;
  onStartElection?: (id: string) => void;
  onEndElection?: (id: string) => void;
}

export default function ElectionDetailModal({
  isOpen,
  election,
  onClose,
  onManageCandidates,
}: ElectionDetailModalProps) {
  if (!election) return null;

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


  const getStatusIcon = (position: number, totalCandidates: number) => {
    // Giả sử top 3 được chọn
    return position <= 3 ? (
      <CheckOutlined className={styles.checkIcon} />
    ) : (
      <CloseIcon className={styles.closeIcon} />
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const safeToLocaleString = (value: number | undefined | null): string => {
    return value?.toLocaleString() || '0';
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={600}
      closeIcon={<CloseOutlined />}
      className={styles.modal}
      style={{ top: 20 }}
    >
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>{election.title}</h1>
            <span className={styles.meetingCode}>{election.meetingCode}</span>
          </div>
        </div>

        {/* Description */}
        <div className={styles.descriptionSection}>
          <p>{election.description}</p>
        </div>

        <div className={styles.divider}></div>

        {/* Scrollable Content Area */}
        <div className={styles.scrollableContent}>
          {/* Thông tin chung */}
          <div className={styles.infoSection}>
            <h3>Thông tin cuộc bầu cử</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <CalendarOutlined className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Ngày diễn ra</span>
                  <span className={styles.infoValue}>{formatDate(election.startDate)}</span>
                </div>
              </div>
              <div className={styles.infoItem}>
                <BarChartOutlined className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Tổng số phiếu</span>
                  <span className={styles.infoValue}>{safeToLocaleString(election.totalShares)} phiếu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kết quả bầu cử */}
          {election.status === 'completed' && election.results && election.results.length > 0 && (
            <div className={styles.resultsSection}>
              <h3>Kết quả bầu cử</h3>
              <div className={styles.resultsList}>
                {election.results.map((result) => (
                  <div key={result.candidateId} className={styles.resultItem}>
                    <div className={styles.candidateStatus}>
                      {getStatusIcon(result.position, election.results!.length)}
                    </div>
                    <div className={styles.candidateMainInfo}>
                      <div className={styles.candidateHeader}>
                        <span className={styles.candidateName}>{result.candidateName}</span>
                      </div>
                      <div className={styles.candidateStats}>
                        <span className={styles.position}>#{result.position}</span>
                        <span className={styles.votes}>{safeToLocaleString(result.shares)} phiếu</span>
                        <span className={styles.percentage}>{result.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Thông tin bổ sung */}
          <div className={styles.additionalInfo}>
            <div className={styles.infoRow}>
              <div className={styles.infoItemCompact}>
                <TeamOutlined className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Tổng số ứng viên</span>
                  <span className={styles.infoValue}>{election.candidates.length} ứng viên</span>
                </div>
              </div>
              <div className={styles.infoItemCompact}>
                <UserOutlined className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Trạng thái</span>
                  <span 
                    className={styles.infoValue}
                    style={{ color: getStatusColor(election.status) }}
                  >
                    {getStatusLabel(election.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsSection}>
          <div className={styles.actions}>
            <button 
              className={styles.manageButton}
              onClick={() => onManageCandidates(election.meetingCode)}
            >
              Quản lý ứng viên
            </button>
            <button 
              className={styles.closeButton}
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}