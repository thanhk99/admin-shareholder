'use client';

import { useState } from 'react';
import { 
  UserOutlined,
  MailOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import modalStyles from '../Modal/Modal.module.css';
import { FormErrors, ShareholderForm } from '@/app/types/shareholder';

interface AddShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddShareholderModal({ isOpen, onClose, onSuccess }: AddShareholderModalProps) {
  const [formData, setFormData] = useState<ShareholderForm>({
    fullname: '',
    email: '',
    shares: 0,
    cccd: '',
    phone:'',
    status: "active"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({}); // Sửa thành FormErrors thay vì Partial<FormErrors>

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

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
      const response = await ShareholderManage.addShareholder({
        fullname: formData.fullname,
        email: formData.email,
        shares: formData.shares,
        cccd: formData.cccd,
        status: 'active'
      });

      if (response.status === "success") {
        // Reset form
        setFormData({
          fullname: '',
          email: '',
          shares: 0,
          cccd: '',
          phone:'',
          status: "active"
        });
        setErrors({});
        onSuccess();
        onClose();
      } else {
        alert(response.message || 'Có lỗi xảy ra khi thêm cổ đông');
      }
    } catch (error: any) {
      console.error('Error adding shareholder:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm cổ đông');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ShareholderForm, value: string | number) => {
    let processedValue: string | number = value;
    
    // Xử lý đặc biệt cho trường shares để tránh NaN
    if (field === 'shares') {
      if (value === '' || isNaN(Number(value))) {
        processedValue = 0;
      } else {
        processedValue = Number(value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field as keyof FormErrors]: undefined
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      fullname: '',
      email: '',
      shares: 0,
      cccd: '',
      phone:'',
      status: "active"
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>Thêm Cổ đông mới</h3>
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
            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
              Số Điện thoại
            </label>
            <div className={modalStyles.inputWithIcon}>
              <IdcardOutlined className={modalStyles.inputIcon} />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Nhập số Sđt"
                disabled={loading}
                className={`${modalStyles.formInput} ${errors.phone ? modalStyles.error : ''}`}
              />
            </div>
            {errors.phone && <span className={modalStyles.errorText}>{errors.phone}</span>}
          </div>
          <div className={modalStyles.formGroup}>
            <label className={modalStyles.formLabel}>
              Số cổ phần
            </label>
            <input
              type="number"
              value={formData.shares}
              onChange={(e) => handleInputChange('shares', e.target.value)}
              placeholder="Nhập số cổ phần"
              disabled={loading}
              min="0"
              className={`${modalStyles.formInput} ${errors.shares ? modalStyles.error : ''}`}
            />
            {errors.shares && <span className={modalStyles.errorText}>{errors.shares}</span>}
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
              {loading ? 'Đang xử lý...' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}