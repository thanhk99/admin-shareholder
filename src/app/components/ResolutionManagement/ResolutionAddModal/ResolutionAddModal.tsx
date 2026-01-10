import { useState } from 'react';
import { Modal, Spin, InputNumber } from 'antd';
import {
  InfoCircleOutlined
} from '@ant-design/icons';
import styles from './ResolutionAddModal.module.css';
import { VotingItemRequest } from '@/app/types/resolution';

interface ResolutionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VotingItemRequest) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  displayOrder: number;
}

interface FormErrors {
  [key: string]: string;
}

export default function ResolutionAddModal({
  isOpen,
  onClose,
  onSave,
  loading = false
}: ResolutionAddModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    displayOrder: 1,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả';
    }

    if (formData.displayOrder < 0) {
      newErrors.displayOrder = 'Thứ tự hiển thị không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      displayOrder: 1,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title="Thêm Nghị Quyết Mới"
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={700}
      centered={true}
      className={styles.modal}
    >
      <div className={styles.modalContent}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <Spin size="large" />
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <InfoCircleOutlined /> Thông tin nghị quyết
            </h3>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Tiêu đề
              </label>
              <input
                type="text"
                className={`${styles.formInput} ${errors.title ? styles.formError : ''}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="VD: Nghị quyết thông qua báo cáo tài chính năm 2025"
              />
              {errors.title && <div className={styles.errorMessage}>{errors.title}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Mô tả chi tiết
              </label>
              <textarea
                className={`${styles.formTextarea} ${errors.description ? styles.formError : ''}`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Thông qua báo cáo tài chính đã được kiểm toán"
                rows={4}
              />
              {errors.description && <div className={styles.errorMessage}>{errors.description}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Thứ tự hiển thị
              </label>
              <InputNumber
                min={0}
                value={formData.displayOrder}
                onChange={(value) => handleInputChange('displayOrder', value || 1)}
                style={{ width: '100%' }}
              />
              {errors.displayOrder && <div className={styles.errorMessage}>{errors.displayOrder}</div>}
            </div>

            <div className={styles.infoBox}>
              <InfoCircleOutlined style={{ marginRight: '8px' }} />
              Hệ thống sẽ tự động tạo 3 tùy chọn biểu quyết: Đồng ý, Không đồng ý, Không ý kiến
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelButton} onClick={handleClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Đang lưu...' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}