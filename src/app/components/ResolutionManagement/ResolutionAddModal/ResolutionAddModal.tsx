import { useState } from 'react';
import { Modal, Spin, Select, InputNumber } from 'antd';
import {
  InfoCircleOutlined,
  AppstoreOutlined,
  NumberOutlined
} from '@ant-design/icons';
import styles from './ResolutionAddModal.module.css';
import { VotingItemRequest, VotingType } from '@/app/types/resolution';

const { Option } = Select;

interface ResolutionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VotingItemRequest) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  title: string;
  description: string;
  votingType: VotingType;
  startTime: string;
  endTime: string;
  maxSelections: number;
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
    votingType: 'YES_NO',
    startTime: '',
    endTime: '',
    maxSelections: 1,
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

    if (formData.maxSelections < 1) {
      newErrors.maxSelections = 'Số lượng lựa chọn tối đa phải >= 1';
    }

    // Chỉ yêu cầu thời gian nếu là loại hình bầu cử (nếu UI có hiển thị)
    if (formData.votingType === 'BOARD_OF_DIRECTORS' || formData.votingType === 'SUPERVISORY_BOARD') {
      if (!formData.startTime) {
        newErrors.startTime = 'Vui lòng chọn thời gian bắt đầu';
      }

      if (!formData.endTime) {
        newErrors.endTime = 'Vui lòng chọn thời gian kết thúc';
      }
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
      await onSave({
        ...formData,
        isActive: true
      } as any);
      handleClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      votingType: 'YES_NO',
      startTime: '',
      endTime: '',
      maxSelections: 1,
      displayOrder: 1,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      title="Thêm Nội dung Biểu quyết Mới"
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
              <InfoCircleOutlined /> Thông tin cơ bản
            </h3>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Loại hình biểu quyết
              </label>
              <Select
                className={styles.selectInput}
                value={formData.votingType}
                onChange={(value) => handleInputChange('votingType', value)}
                style={{ width: '100%' }}
              >
                <Option value="YES_NO">Biểu quyết (Tờ trình)</Option>
                <Option value="RESOLUTION">Nghị quyết</Option>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                Tiêu đề
              </label>
              <input
                type="text"
                className={`${styles.formInput} ${errors.title ? styles.formError : ''}`}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="VD: Tờ trình phê duyệt..."
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
                placeholder="Mô tả chi tiết..."
                rows={4}
              />
              {errors.description && <div className={styles.errorMessage}>{errors.description}</div>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Thứ tự hiển thị
              </label>
              <InputNumber
                min={1}
                value={(formData as any).displayOrder || 1}
                onChange={(value) => handleInputChange('displayOrder', value)}
                style={{ width: '100%' }}
              />
            </div>

            {(formData.votingType === 'BOARD_OF_DIRECTORS' || formData.votingType === 'SUPERVISORY_BOARD') && (
              <>
                <div className={styles.formGroup}>
                  <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                    Thời gian bắt đầu *
                  </label>
                  <input
                    type="datetime-local"
                    className={`${styles.formInput} ${errors.startTime ? styles.formError : ''}`}
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                  {errors.startTime && <div className={styles.errorMessage}>{errors.startTime}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={`${styles.formLabel} ${styles.formLabelRequired}`}>
                    Thời gian kết thúc *
                  </label>
                  <input
                    type="datetime-local"
                    className={`${styles.formInput} ${errors.endTime ? styles.formError : ''}`}
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                  />
                  {errors.endTime && <div className={styles.errorMessage}>{errors.endTime}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Số lượng lựa chọn tối đa
                  </label>
                  <InputNumber
                    min={1}
                    value={formData.maxSelections}
                    onChange={(value) => handleInputChange('maxSelections', value)}
                    style={{ width: '100%' }}
                  />
                  {errors.maxSelections && <div className={styles.errorMessage}>{errors.maxSelections}</div>}
                </div>
              </>
            )}
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