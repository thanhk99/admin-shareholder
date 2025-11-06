'use client';

import { 
  CloseOutlined
} from '@ant-design/icons';
import styles from './MeetingAddModal.module.css';
import { Meeting } from '@/app/types/meeting';
import { useEffect, useState } from 'react';

interface MeetingFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  meeting?: Meeting | null;
  onClose: () => void;
  onSubmit: (meetingData: any) => void;
  loading?: boolean;
}

// Hàm format thời gian cho input type="time"
const formatTimeForInput = (timeString: string | undefined) => {
  if (!timeString) return '';
  
  // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
  const trimmedTime = timeString.trim();
  if (!trimmedTime) return '';
  
  // Tách chuỗi thời gian thành các phần
  const parts = trimmedTime.split(':');
  if (parts.length < 2) return '';
  
  // Đảm bảo giờ và phút có 2 chữ số
  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

export default function MeetingFormModal({ 
  isOpen, 
  mode, 
  meeting, 
  onClose, 
  onSubmit,
  loading = false 
}: MeetingFormModalProps) {
  const [formData, setFormData] = useState({
    title: meeting?.title || '',
    description: meeting?.description || '',
    meetingDate: meeting?.meetingDate ? meeting.meetingDate.split('T')[0] : '',
    dayStart: formatTimeForInput(meeting?.dayStart), // Format ngay từ đầu
    dayEnd: formatTimeForInput(meeting?.dayEnd), // Format ngay từ đầu
    location: meeting?.location || '',
    status: meeting?.status || 'PENDING'
  });

  // Cập nhật form data khi meeting thay đổi
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description,
        meetingDate: meeting.meetingDate.split('T')[0],
        dayStart: formatTimeForInput(meeting.dayStart),
        dayEnd: formatTimeForInput(meeting.dayEnd),
        location: meeting.location,
        status: meeting.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        meetingDate: '',
        dayStart: '',
        dayEnd: '',
        location: '',
        status: 'PENDING'
      });
    }
  }, [meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{mode === 'create' ? 'Tạo Cuộc họp mới' : 'Chỉnh sửa Cuộc họp'}</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            disabled={loading}
          >
            <CloseOutlined />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Tiêu đề cuộc họp *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Nhập tiêu đề cuộc họp"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả cuộc họp"
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Ngày họp *</label>
              <input
                type="date"
                value={formData.meetingDate}
                onChange={(e) => setFormData({...formData, meetingDate: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Giờ bắt đầu *</label>
              <input
                type="time"
                value={formData.dayStart}
                onChange={(e) => setFormData({...formData, dayStart: e.target.value})}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Giờ kết thúc *</label>
              <input
                type="time"
                value={formData.dayEnd}
                onChange={(e) => setFormData({...formData, dayEnd: e.target.value})}
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Địa điểm *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="Nhập địa điểm tổ chức"
              required
              disabled={loading}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value as 'PENDING' | 'UPCOMING' | 'COMPLETED'})}
              disabled={loading}
            >
              <option value="UPCOMING">Sắp diễn ra</option>
              <option value="PENDING">Đang diễn ra</option>
              <option value="COMPLETED">Đã kết thúc</option>
            </select>
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button"
              className={styles.cancelButton} 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className={styles.saveButton} 
              disabled={
                loading || 
                !formData.title || 
                !formData.meetingDate || 
                !formData.dayStart || 
                !formData.dayEnd || 
                !formData.location
              }
            >
              {loading ? 'Đang xử lý...' : mode === 'create' ? 'Tạo' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}