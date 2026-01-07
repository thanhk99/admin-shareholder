'use client';

import { useState, useEffect } from 'react';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@ant-design/icons';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import modalStyles from '../Modal/Modal.module.css';
import { Shareholder } from '@/app/types/shareholder';

interface EditShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shareholder: Shareholder | null;
}

interface FormData {
  fullname: string;
  email: string;
  shares: number;
  cccd: string;
  phone: string;
  status: boolean;
  address: string;
  birthDay?: string;
  nation?: string;
}

interface FormErrors {
  fullname?: string;
  email?: string;
  shares?: string;
  cccd?: string;
  phone?: string;
  address?: string;
}

export default function EditShareholderModal({
  isOpen,
  onClose,
  onSuccess,
  shareholder
}: EditShareholderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    email: '',
    shares: 0,
    cccd: '',
    phone: '',
    status: true,
    address: '',
    birthDay: '',
    nation: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Hàm chuyển đổi định dạng ngày từ dd/MM/yyyy sang yyyy-MM-dd
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';

    // Nếu đã là định dạng yyyy-MM-dd thì giữ nguyên
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Chuyển từ dd/MM/yyyy sang yyyy-MM-dd
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return dateString;
  };

  // Hàm chuyển đổi ngược lại từ yyyy-MM-dd sang dd/MM/yyyy để gửi API
  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';

    // Nếu đã là định dạng dd/MM/yyyy thì giữ nguyên
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // Chuyển từ yyyy-MM-dd sang dd/MM/yyyy
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }

    return dateString;
  };

  // Cập nhật form data khi shareholder prop thay đổi
  useEffect(() => {
    if (shareholder) {
      setFormData({
        fullname: shareholder.fullName || '',
        email: shareholder.email || '',
        shares: shareholder.ownShares || 0,
        cccd: shareholder.cccd || '',
        phone: shareholder.phone || '',
        status: shareholder.status ?? true,
        address: shareholder.address || '',
        birthDay: formatDateForInput(shareholder.birthDay || ''),
        nation: shareholder.nation || ''
      });
    }
  }, [shareholder]);

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
    } else if (!/^\d{9,12}$/.test(formData.cccd)) {
      newErrors.cccd = 'Số CCCD phải từ 9-12 chữ số';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^(0|\+84)(\d{9,10})$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (formData.shares < 0) {
      newErrors.shares = 'Số cổ phần không được âm';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!shareholder?.shareholderCode) {
      alert('Không tìm thấy ID người dùng');
      return;
    }

    setLoading(true);
    try {

      // Chuẩn bị dữ liệu để gửi API, chuyển đổi ngày về định dạng dd/MM/yyyy
      const apiData = {
        fullname: formData.fullname,
        email: formData.email,
        shares: formData.shares,
        cccd: formData.cccd,
        phone: formData.phone,
        status: formData.status,
        address: formData.address,
        birthDay: formatDateForAPI(formData.birthDay || ''),
        nation: formData.nation
      };

      const response = await ShareholderManage.updateShareholder(apiData);
      if (response.status === "success") {
        onSuccess();
        onClose();
        alert('Cập nhật thông tin người dùng thành công!');
      } else {
        alert(response.message || 'Có lỗi xảy ra khi cập nhật người dùng');
      }
    } catch (error: any) {
      console.error('Error updating shareholder:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
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
        fullname: shareholder.fullName || '',
        email: shareholder.email,
        shares: shareholder.ownShares,
        cccd: shareholder.cccd,
        phone: shareholder.phone,
        status: shareholder.status ?? true,
        address: shareholder.address,
        birthDay: formatDateForInput(shareholder.birthDay || ''),
        nation: shareholder.nation || ''
      });
    }
    setErrors({});
    onClose();
  };

  if (!isOpen || !shareholder) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>Chỉnh sửa Thông tin Người dùng</h3>
          <button
            className={modalStyles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalStyles.modalForm}>
          <div className={modalStyles.formRow}>
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
                  placeholder="Nhập họ tên người dùng"
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
          </div>

          <div className={modalStyles.formRow}>
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
                Số điện thoại
              </label>
              <div className={modalStyles.inputWithIcon}>
                <PhoneOutlined className={modalStyles.inputIcon} />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  disabled={loading}
                  className={`${modalStyles.formInput} ${errors.phone ? modalStyles.error : ''}`}
                />
              </div>
              {errors.phone && <span className={modalStyles.errorText}>{errors.phone}</span>}
            </div>
          </div>

          <div className={modalStyles.formRow}>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.formLabel}>
                Ngày sinh
              </label>
              <input
                type="date"
                value={formData.birthDay}
                onChange={(e) => handleInputChange('birthDay', e.target.value)}
                disabled={loading}
                className={modalStyles.formInput}
              />
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.formLabel}>
                Quốc tịch
              </label>
              <input
                type="text"
                value={formData.nation}
                onChange={(e) => handleInputChange('nation', e.target.value)}
                placeholder="Nhập quốc tịch"
                disabled={loading}
                className={modalStyles.formInput}
              />
            </div>
          </div>

          <div className={modalStyles.formGroup}>
            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
              Địa chỉ
            </label>
            <div className={modalStyles.inputWithIcon}>
              <HomeOutlined className={modalStyles.inputIcon} />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Nhập địa chỉ"
                disabled={loading}
                className={`${modalStyles.formInput} ${errors.address ? modalStyles.error : ''}`}
              />
            </div>
            {errors.address && <span className={modalStyles.errorText}>{errors.address}</span>}
          </div>

          <div className={modalStyles.formRow}>
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
                value={formData.status.toString()}
                onChange={(e) => handleInputChange('status', e.target.value === 'true')}
                disabled={loading}
                className={modalStyles.formSelect}
              >
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
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