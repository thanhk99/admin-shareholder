'use client';

import {
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import styles from './MeetingDetailsModal.module.css';
import { Meeting } from '@/app/types/meeting';

interface MeetingDetailModalProps {
  isOpen: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onEdit: (meeting: Meeting) => void;
  loading?: boolean;
}

export default function MeetingDetailModal({
  isOpen,
  meeting,
  onClose,
  onEdit,
  loading = false
}: MeetingDetailModalProps) {
  if (!isOpen || !meeting) return null;

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Chưa cập nhật';
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      SCHEDULED: 'Sắp diễn ra',
      ONGOING: 'Đang diễn ra',
      COMPLETED: 'Đã kết thúc',
      CANCELLED: 'Đã hủy'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SCHEDULED: '#3498db',
      ONGOING: '#f39c12',
      COMPLETED: '#27ae60',
      CANCELLED: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Chi tiết Cuộc họp</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            <CloseOutlined />
          </button>
        </div>

        <div className={styles.detailContent}>
          <div className={styles.detailHeader}>
            <h2>{meeting.title}</h2>
            <span
              className={styles.status}
              style={{ backgroundColor: getStatusColor(meeting.status) }}
            >
              {getStatusLabel(meeting.status)}
            </span>
          </div>

          <p className={styles.detailDescription}>{meeting.description}</p>

          <div className={styles.detailGrid}>
            <div className={styles.detailSection}>
              <h4><CalendarOutlined /> Thông tin thời gian</h4>
              <div className={styles.detailItem}>
                <strong>Mã cuộc họp:</strong>
                <span>{meeting.meetingCode}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Thời gian bắt đầu:</strong>
                <span>{formatDate(meeting.startTime)}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Thời gian kết thúc:</strong>
                <span>{formatDate(meeting.endTime)}</span>
              </div>
              <div className={styles.detailItem}>
                <strong>Địa điểm:</strong>
                <span>{meeting.location}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h4><TeamOutlined /> Người tham gia</h4>
              <div className={styles.participants}>
                {meeting.participants > 0 ? (
                  <div className={styles.participant}>
                    <UserOutlined />
                    <span>{meeting.participants} người tham gia</span>
                  </div>
                ) : (
                  <p className={styles.noData}>Chưa có người tham gia</p>
                )}
              </div>
            </div>
          </div>

          {meeting.agenda && meeting.agenda.length > 0 && (
            <div className={styles.detailSection}>
              <h4>Biểu quyết: </h4>
              <div className={styles.agendaList}>
                {meeting.agenda.map((item, index) => (
                  <div key={index} className={styles.agendaItemDetail}>
                    <span className={styles.agendaNumber}>{index + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {meeting.candidates && meeting.candidates.length > 0 && (
            <div className={styles.detailSection}>
              <h4>Bầu cử HĐQT: </h4>
              <div className={styles.agendaList}>
                {meeting.candidates.map((item, index) => (
                  <div key={index} className={styles.agendaItemDetail}>
                    <span className={styles.agendaNumber}>{index + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.detailActions}>
            <button
              className={styles.editButton}
              onClick={() => onEdit(meeting)}
              disabled={loading}
            >
              <EditOutlined />
              Chỉnh sửa
            </button>
            <button
              onClick={() => onClose()}
              className={styles.deleteButton}
              disabled={loading}
            >
              <CloseOutlined />
              Thoát
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}