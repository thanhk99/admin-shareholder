import { useState } from 'react';
import { Modal, Spin } from 'antd';
import { 
  InfoCircleOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import styles from './ResolutionAddModal.module.css';
import { Resolution } from '@/app/types/resolution';

interface ResolutionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resolutionData: Omit<Resolution, 'id' | 'createdAt'>) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  meetingCode: string;
  resolutionCode: string;
  title: string;
  description: string;
  totalAgree: number;
  totalNotAgree: number;
  totalNotIdea: number;
  createBy: string;
  isActive: boolean;
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
    meetingCode: '',
    resolutionCode: '',
    title: '',
    description: '',
    totalAgree: 0,
    totalNotAgree: 0,
    totalNotIdea: 0,
    createBy: '',
    isActive: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.meetingCode.trim()) {
      newErrors.meetingCode = 'Vui lòng nhập mã cuộc họp';
    }

    if (!formData.resolutionCode.trim()) {
      newErrors.resolutionCode = 'Vui lòng nhập mã nghị quyết';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề nghị quyết';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả nghị quyết';
    }

    if (!formData.createBy.trim()) {
      newErrors.createBy = 'Vui lòng nhập người tạo';
    }

    if (formData.totalAgree < 0 || formData.totalNotAgree < 0 || formData.totalNotIdea < 0) {
      newErrors.totalAgree = 'Số phiếu không được âm';
    }

    const totalVotes = formData.totalAgree + formData.totalNotAgree + formData.totalNotIdea;
    if (totalVotes === 0) {
      newErrors.totalAgree = 'Tổng số phiếu phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
      handleClose();
    } catch (error) {
      console.error('Error saving resolution:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      meetingCode: '',
      resolutionCode: '',
      title: '',
      description: '',
      totalAgree: 0,
      totalNotAgree: 0,
      totalNotIdea: 0,
      createBy: '',
      isActive: true
    });
    setErrors({});
    onClose();
  };

  const totalVotes = formData.totalAgree + formData.totalNotAgree + formData.totalNotIdea;
  const agreePercentage = totalVotes > 0 ? Math.round((formData.totalAgree / totalVotes) * 100) : 0;
  const isApproved = formData.totalAgree > formData.totalNotAgree;

  return (
    <Modal
      title="Thêm Nghị quyết Mới"
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
          {/* Thông tin cơ bản */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <InfoCircleOutlined /> Thông tin cơ bản
            </h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                  Mã cuộc họp
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${errors.meetingCode ? styles.formError : ''}`}
                  value={formData.meetingCode}
                  onChange={(e) => handleInputChange('meetingCode', e.target.value)}
                  placeholder="VD: CLIENT-ABC-MEET"
                />
                {errors.meetingCode && (
                  <div className={styles.errorMessage}>{errors.meetingCode}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                  Mã nghị quyết
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${errors.resolutionCode ? styles.formError : ''}`}
                  value={formData.resolutionCode}
                  onChange={(e) => handleInputChange('resolutionCode', e.target.value)}
                  placeholder="VD: RES-2024-001"
                />
                {errors.resolutionCode && (
                  <div className={styles.errorMessage}>{errors.resolutionCode}</div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Tiêu đề nghị quyết
              </label>
              <input
                type="text"
                className={`${styles.formInput} ${errors.title ? styles.formError : ''}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="VD: Thông qua Báo cáo Tài chính năm 2023"
              />
              {errors.title && (
                <div className={styles.errorMessage}>{errors.title}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Mô tả chi tiết
              </label>
              <textarea
                className={`${styles.formTextarea} ${errors.description ? styles.formError : ''}`}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về nội dung nghị quyết..."
                rows={4}
              />
              {errors.description && (
                <div className={styles.errorMessage}>{errors.description}</div>
              )}
            </div>
          </div>

          {/* Thông tin biểu quyết */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <UserOutlined /> Kết quả biểu quyết
            </h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số phiếu đồng ý</label>
                <input
                  type="number"
                  min="0"
                  className={`${styles.formInput} ${errors.totalAgree ? styles.formError : ''}`}
                  value={formData.totalAgree}
                  onChange={(e) => handleInputChange('totalAgree', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số phiếu không đồng ý</label>
                <input
                  type="number"
                  min="0"
                  className={styles.formInput}
                  value={formData.totalNotAgree}
                  onChange={(e) => handleInputChange('totalNotAgree', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Số phiếu không ý kiến</label>
                <input
                  type="number"
                  min="0"
                  className={styles.formInput}
                  value={formData.totalNotIdea}
                  onChange={(e) => handleInputChange('totalNotIdea', parseInt(e.target.value) || 0)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                  Người tạo
                </label>
                <input
                  type="text"
                  className={`${styles.formInput} ${errors.createBy ? styles.formError : ''}`}
                  value={formData.createBy}
                  onChange={(e) => handleInputChange('createBy', e.target.value)}
                  placeholder="VD: admin"
                />
                {errors.createBy && (
                  <div className={styles.errorMessage}>{errors.createBy}</div>
                )}
              </div>
            </div>

            {/* Voting Summary */}
            <div className={styles.votingSettings}>
              <div className={styles.votingItem}>
                <span className={styles.votingLabel}>Tổng số phiếu:</span>
                <span className={styles.votingValue}>{totalVotes}</span>
              </div>
              <div className={styles.votingItem}>
                <span className={styles.votingLabel}>Tỷ lệ đồng ý:</span>
                <span className={styles.votingValue}>{agreePercentage}%</span>
              </div>
              <div className={styles.votingItem}>
                <span className={styles.votingLabel}>Kết quả:</span>
                <span className={styles.votingValue}>
                  {isApproved ? 'ĐÃ THÔNG QUA' : 'KHÔNG THÔNG QUA'}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Thêm Nghị quyết'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}