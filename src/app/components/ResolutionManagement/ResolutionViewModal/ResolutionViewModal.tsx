import { Modal } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  CheckOutlined, 
  CloseOutlined 
} from '@ant-design/icons';
import styles from './ResolutionViewModal.module.css';
import { Resolution } from '@/app/types/resolution';

interface ResolutionViewModalProps {
  isOpen: boolean;
  resolution: Resolution | null;
  onClose: () => void;
}

export default function ResolutionViewModal({ 
  isOpen, 
  resolution, 
  onClose 
}: ResolutionViewModalProps) {
  
  if (!resolution) return null;

  const totalVotes = resolution.totalAgree + resolution.totalNotAgree + resolution.totalNotIdea;
  const agreePercentage = totalVotes > 0 ? Math.round((resolution.totalAgree / totalVotes) * 100) : 0;
  const isApproved = resolution.totalAgree > resolution.totalNotAgree;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <Modal
      title="Chi tiết Nghị quyết"
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
              <span className={styles.infoLabel}>Mã nghị quyết:</span>
              <span className={styles.infoValue}>{resolution.resolutionCode}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Tiêu đề:</span>
              <span className={styles.infoValue}>{resolution.title}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Mô tả:</span>
              <span className={styles.infoValue}>{resolution.description}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Trạng thái:</span>
              <span className={`${styles.status} ${isApproved ? styles.approved : styles.rejected}`}>
                {isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Thông tin tạo</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><UserOutlined /> Người tạo:</span>
              <span className={styles.infoValue}>{resolution.createBy}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}><CalendarOutlined /> Ngày tạo:</span>
              <span className={styles.infoValue}>{formatDate(resolution.createdAt)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Trạng thái hoạt động:</span>
              <span className={resolution.isActive ? styles.active : styles.inactive}>
                {resolution.isActive ? 'Đang hoạt động' : 'Đã khoá'}
              </span>
            </div>
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
                <span className={styles.voteCount}>{resolution.totalAgree} phiếu</span>
                <span className={styles.votePercentage}>
                  {totalVotes > 0 ? Math.round((resolution.totalAgree / totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className={styles.voteItem}>
              <div className={styles.voteType}>
                <CloseOutlined className={styles.disagreeIcon} />
                <span>Không đồng ý</span>
              </div>
              <div className={styles.voteStats}>
                <span className={styles.voteCount}>{resolution.totalNotAgree} phiếu</span>
                <span className={styles.votePercentage}>
                  {totalVotes > 0 ? Math.round((resolution.totalNotAgree / totalVotes) * 100) : 0}%
                </span>
              </div>
            </div>
            
            <div className={styles.voteItem}>
              <div className={styles.voteType}>
                <UserOutlined className={styles.abstainIcon} />
                <span>Không ý kiến</span>
              </div>
              <div className={styles.voteStats}>
                <span className={styles.voteCount}>{resolution.totalNotIdea} phiếu</span>
                <span className={styles.votePercentage}>
                  {totalVotes > 0 ? Math.round((resolution.totalNotIdea / totalVotes) * 100) : 0}%
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