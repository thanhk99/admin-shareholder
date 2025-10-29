'use client';

import { useState, useEffect } from 'react';
import { 
  UserOutlined,
  MailOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import modalStyles from '../Modal/Modal.module.css';
import { FormErrors, ShareholderForm } from '@/app/types/shareholder';

interface Shareholder {
  id: string;
  fullname: string;
  email: string;
  shares: number;
  cccd: string;
  phone: string,
  status: 'active' | 'inactive';
}

interface EditShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shareholder: Shareholder;
}

export default function EditShareholderModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  shareholder 
}: EditShareholderModalProps) {
  const [formData, setFormData] = useState<ShareholderForm>({
    fullname: '',
    email: '',
    shares: 0,
    cccd: '',
    phone:'',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormErrors>>({});

  // Cập nhật form data khi shareholder prop thay đổi
  useEffect(() => {
    if (shareholder) {
      setFormData({
        fullname: shareholder.fullname,
        email: shareholder.email,
        shares: shareholder.shares,
        cccd: shareholder.cccd,
        phone:shareholder.phone,
        status: shareholder.status
      });
    }
  }, [shareholder]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormErrors> = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Họ tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.cccd.trim()) {
      newErrors.cccd = 'Số CCCD là bắt buộc';
    } else if (!/^\d+$/.test(formData.cccd)) {
      newErrors.cccd = 'Số CCCD phải là số';
    }

    if (formData.shares < 0) {
      newErrors.shares = 'Số cổ phần không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await ShareholderManage.updateShareholder(shareholder.id, {
        fullname: formData.fullname,
        email: formData.email,
        shares: formData.shares,
        cccd: formData.cccd,
        status: formData.status
      });

      if (response.status === "success") {
        onSuccess();
        onClose();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật cổ đông');
      }
    } catch (error: any) {
      console.error('Error updating shareholder:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật cổ đông');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ShareholderForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClose = () => {
    // Reset form về giá trị ban đầu từ shareholder
    if (shareholder) {
      setFormData({
        fullname: shareholder.fullname,
        email: shareholder.email,
        shares: shareholder.shares,
        cccd: shareholder.cccd,
        phone:shareholder.phone,
        status: shareholder.status
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>Chỉnh sửa Thông tin Cổ đông</h3>
          <button 
            className={modalStyles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalStyles.modalForm}>
          <div className={modalStyles.formGroup}>
            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
              Họ tên
            </label>
            <div className={modalStyles.inputWithIcon}>
              <UserOutlined className={modalStyles.inputIcon} />
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => handleInputChange('fullname', e.target.value)}
                placeholder="Nhập họ tên cổ đông"
                disabled={loading}
                className={`${modalStyles.formInput} ${errors.fullname ? modalStyles.error : ''}`}
              />
            </div>
            {errors.fullname && <span className={modalStyles.errorText}>{errors.fullname}</span>}
          </div>

          <div className={modalStyles.formGroup}>
            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
              Email
            </label>
            <div className={modalStyles.inputWithIcon}>
              <MailOutlined className={modalStyles.inputIcon} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Nhập email"
                disabled={loading}
                className={`${modalStyles.formInput} ${errors.email ? modalStyles.error : ''}`}
              />
            </div>
            {errors.email && <span className={modalStyles.errorText}>{errors.email}</span>}
          </div>

          <div className={modalStyles.formGroup}>
            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
              Số CCCD
            </label>
            <div className={modalStyles.inputWithIcon}>
              <IdcardOutlined className={modalStyles.inputIcon} />
              <input
                type="text"
                value={formData.cccd}
                onChange={(e) => handleInputChange('cccd', e.target.value)}
                placeholder="Nhập số CCCD"
                disabled={loading}
                className={`${modalStyles.formInput} ${errors.cccd ? modalStyles.error : ''}`}
              />
            </div>
            {errors.cccd && <span className={modalStyles.errorText}>{errors.cccd}</span>}
          </div>

          <div className={modalStyles.formGroup}>
            <label className={modalStyles.formLabel}>
              Số cổ phần
            </label>
            <input
              type="number"
              value={formData.shares}
              onChange={(e) => handleInputChange('shares', parseInt(e.target.value) || 0)}
              placeholder="Nhập số cổ phần"
              disabled={loading}
              min="0"
              className={`${modalStyles.formInput} ${errors.shares ? modalStyles.error : ''}`}
            />
            {errors.shares && <span className={modalStyles.errorText}>{errors.shares}</span>}
          </div>

          <div className={modalStyles.formGroup}>
            <label className={modalStyles.formLabel}>
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
              disabled={loading}
              className={modalStyles.formSelect}
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>

          <div className={modalStyles.formActions}>
            <button 
              type="button"
              className={modalStyles.cancelButton} 
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit"
              className={modalStyles.saveButton} 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}