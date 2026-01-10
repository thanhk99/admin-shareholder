'use client';

import { useState } from 'react';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  KeyOutlined,
  CalendarOutlined,
  GlobalOutlined,
  NumberOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';
import { useEffect } from 'react';
import modalStyles from '../Modal/Modal.module.css';

interface AddShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  password?: string;
  fullName: string;
  email: string;
  sharesOwned: number;
  cccd: string;
  phoneNumber: string;
  address: string;
  dateOfIssue?: string;
  investorCode: string;
  meetingId: string;
}

interface FormErrors {
  password?: string;
  fullName?: string;
  email?: string;
  sharesOwned?: string;
  cccd?: string;
  phoneNumber?: string;
  address?: string;
  investorCode?: string;
  dateOfIssue?: string;
  meetingId?: string;
}

export default function AddShareholderModal({ isOpen, onClose, onSuccess }: AddShareholderModalProps) {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    fullName: '',
    email: '',
    sharesOwned: 0,
    cccd: '',
    phoneNumber: '',
    address: '',
    dateOfIssue: '',
    investorCode: '',
    meetingId: ''
  });
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      fetchMeetings();
    }
  }, [isOpen]);

  const fetchMeetings = async () => {
    try {
      const response = await MeetingService.getAllMeetings();
      // Handle both wrapped {status, data} and direct array responses
      const res = response as any;
      if (Array.isArray(res)) {
        setMeetings(res);
      } else if (res.status === "success" || res.status === 200) {
        setMeetings(res.data || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  const formatDateForAPI = (dateString: string): string => {
    if (!dateString) return '';
    return dateString;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};


    if (!formData.password?.trim()) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải ít nhất 6 ký tự';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.cccd.trim()) {
      newErrors.cccd = 'Số CCCD là bắt buộc';
    }

    if (!formData.investorCode.trim()) {
      newErrors.investorCode = 'Mã nhà đầu tư là bắt buộc';
    }

    if (!formData.meetingId) {
      newErrors.meetingId = 'Vui lòng chọn đại hội';
    }

    if (formData.sharesOwned < 0) {
      newErrors.sharesOwned = 'Số cổ phần không được âm';
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
      const apiData = {
        ...formData,
        dateOfIssue: formatDateForAPI(formData.dateOfIssue || '')
      };

      const response = await ShareholderManage.addShareholder(apiData as any);
      if (response.status === 200 || (response as any).status === "success") {
        handleClose();
        onSuccess();
      } else {
        alert((response as any).message || 'Có lỗi xảy ra khi thêm người dùng');
      }
    } catch (error: any) {
      console.error('Error adding shareholder:', error);
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi thêm người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    let processedValue: string | number = value;

    if (field === 'sharesOwned') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleClose = () => {
    setFormData({
      password: '',
      fullName: '',
      email: '',
      sharesOwned: 0,
      cccd: '',
      phoneNumber: '',
      address: '',
      dateOfIssue: '',
      investorCode: '',
      meetingId: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>Thêm Người dùng mới</h3>
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
                Mật khẩu
              </label>
              <div className={modalStyles.inputWithIcon}>
                <KeyOutlined className={modalStyles.inputIcon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  className={`${modalStyles.formInput} ${errors.password ? modalStyles.error : ''}`}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#a0aec0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                </div>
              </div>
              {errors.password && <span className={modalStyles.errorText}>{errors.password}</span>}
            </div>
          </div>

          <div className={modalStyles.formRow}>
            <div className={modalStyles.formGroup}>
              <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
                Họ tên
              </label>
              <div className={modalStyles.inputWithIcon}>
                <UserOutlined className={modalStyles.inputIcon} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Nhập họ tên"
                  disabled={loading}
                  className={`${modalStyles.formInput} ${errors.fullName ? modalStyles.error : ''}`}
                />
              </div>
              {errors.fullName && <span className={modalStyles.errorText}>{errors.fullName}</span>}
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
                Mã nhà đầu tư
              </label>
              <div className={modalStyles.inputWithIcon}>
                <NumberOutlined className={modalStyles.inputIcon} />
                <input
                  type="text"
                  value={formData.investorCode}
                  onChange={(e) => handleInputChange('investorCode', e.target.value)}
                  placeholder="Nhập mã nhà đầu tư"
                  disabled={loading}
                  className={`${modalStyles.formInput} ${errors.investorCode ? modalStyles.error : ''}`}
                />
              </div>
              {errors.investorCode && <span className={modalStyles.errorText}>{errors.investorCode}</span>}
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
          </div>

          <div className={modalStyles.formRow}>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.formLabel}>
                Số điện thoại
              </label>
              <div className={modalStyles.inputWithIcon}>
                <PhoneOutlined className={modalStyles.inputIcon} />
                <input
                  type="text"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  disabled={loading}
                  className={`${modalStyles.formInput} ${errors.phoneNumber ? modalStyles.error : ''}`}
                />
              </div>
            </div>

            <div className={modalStyles.formGroup}>
              <label className={modalStyles.formLabel}>
                Số cổ phần
              </label>
              <div className={modalStyles.inputWithIcon}>
                <NumberOutlined className={modalStyles.inputIcon} />
                <input
                  type="number"
                  value={formData.sharesOwned}
                  onChange={(e) => handleInputChange('sharesOwned', e.target.value)}
                  placeholder="Nhập số cổ phần"
                  disabled={loading}
                  className={`${modalStyles.formInput} ${errors.sharesOwned ? modalStyles.error : ''}`}
                />
              </div>
            </div>
          </div>

          <div className={modalStyles.formRow}>
            <div className={modalStyles.formGroup}>
              <label className={modalStyles.formLabel}>
                Ngày cấp CCCD
              </label>
              <div className={modalStyles.inputWithIcon}>
                <CalendarOutlined className={modalStyles.inputIcon} />
                <input
                  type="date"
                  value={formData.dateOfIssue}
                  onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                  disabled={loading}
                  className={modalStyles.formInput}
                />
              </div>
            </div>
          </div>

          <div className={modalStyles.formGroup}>
            <label className={`${modalStyles.formLabel} ${modalStyles.required}`}>
              Đại hội cổ đông
            </label>
            <div className={modalStyles.inputWithIcon}>
              <GlobalOutlined className={modalStyles.inputIcon} />
              <select
                value={formData.meetingId}
                onChange={(e) => handleInputChange('meetingId', e.target.value)}
                disabled={loading}
                className={`${modalStyles.formInput} ${errors.meetingId ? modalStyles.error : ''}`}
              >
                <option value="">Chọn đại hội</option>
                {meetings.map((meeting) => (
                  <option key={meeting.id} value={meeting.id}>
                    {meeting.title}
                  </option>
                ))}
              </select>
            </div>
            {errors.meetingId && <span className={modalStyles.errorText}>{errors.meetingId}</span>}
          </div>

          <div className={modalStyles.formGroup}>
            <label className={modalStyles.formLabel}>
              Địa chỉ
            </label>
            <div className={modalStyles.inputWithIcon}>
              <EnvironmentOutlined className={modalStyles.inputIcon} />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Nhập địa chỉ"
                disabled={loading}
                className={modalStyles.formInput}
              />
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
              {loading ? 'Đang xử lý...' : 'Thêm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}