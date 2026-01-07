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
    startTime: meeting?.startTime || '',
    endTime: meeting?.endTime || '',
    location: meeting?.location || '',
    status: meeting?.status || 'SCHEDULED'
  });

  // Cập nhật form data khi meeting thay đổi
  useEffect(() => {
    if (meeting) {
      setFormData({
        title: meeting.title,
        description: meeting.description,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        location: meeting.location,
        status: meeting.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        status: 'SCHEDULED'
      });
    }
  }, [meeting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

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
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Nhập tiêu đề cuộc họp"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Nhập mô tả cuộc họp"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Thời gian bắt đầu *</label>
            <input
              type="datetime-local"
              value={formData.startTime ? formData.startTime.slice(0, 16) : ''}
              onChange={(e) => handleInputChange('startTime', e.target.value + ':00')}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Thời gian kết thúc *</label>
            <input
              type="datetime-local"
              value={formData.endTime ? formData.endTime.slice(0, 16) : ''}
              onChange={(e) => handleInputChange('endTime', e.target.value + ':00')}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Địa điểm *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Nhập địa điểm tổ chức"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              disabled={loading}
            >
              <option value="SCHEDULED">Sắp diễn ra</option>
              <option value="ONGOING">Đang diễn ra</option>
              <option value="COMPLETED">Đã kết thúc</option>
              <option value="CANCELLED">Đã hủy</option>
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
                !formData.startTime ||
                !formData.endTime ||
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