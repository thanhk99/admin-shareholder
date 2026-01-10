'use client';

import { useState, useEffect } from 'react';
import {
    UserOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    GlobalOutlined,
    NumberOutlined,
    CheckCircleOutlined,
    LockOutlined
} from '@ant-design/icons';
import ProxyService from '@/lib/api/proxy';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';
import { NonShareholderProxyRequest, NonShareholderProxyResponse } from '@/app/types/proxy';
import modalStyles from '../Modal/Modal.module.css';
import styles from './AddRepresentativeModal.module.css';

interface AddRepresentativeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AddRepresentativeModal({ isOpen, onClose, onSuccess }: AddRepresentativeModalProps) {
    const [formData, setFormData] = useState<NonShareholderProxyRequest>({
        fullName: '',
        cccd: '',
        dateOfIssue: '',
        address: '',
        meetingId: '',
        delegatorCccd: '',
        sharesDelegated: 0
    });

    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<NonShareholderProxyResponse | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMeetings();
            setSuccessData(null);
        }
    }, [isOpen]);

    const fetchMeetings = async () => {
        try {
            const response = await MeetingService.getAllMeetings();
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

    const handleInputChange = (field: keyof NonShareholderProxyRequest, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            [field]: field === 'sharesDelegated' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await ProxyService.createNonShareholderProxy(formData);
            setSuccessData((response as any).data || response);
            onSuccess();
        } catch (error: any) {
            console.error('Error adding representative:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi thêm người đại diện');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            fullName: '',
            cccd: '',
            dateOfIssue: '',
            address: '',
            meetingId: '',
            delegatorCccd: '',
            sharesDelegated: 0
        });
        setSuccessData(null);
        onClose();
    };

    if (!isOpen) return null;

    if (successData) {
        return (
            <div className={modalStyles.modalOverlay}>
                <div className={modalStyles.modalContent}>
                    <div className={modalStyles.modalHeader}>
                        <h3 className={modalStyles.modalTitle}>Thêm thành công</h3>
                        <button className={modalStyles.closeButton} onClick={handleClose}>×</button>
                    </div>
                    <div className={styles.successContent}>
                        <CheckCircleOutlined className={styles.successIcon} />
                        <h4>Người đại diện đã được tạo thành công!</h4>
                        <p>Vui lòng cung cấp thông tin sau cho người đại diện:</p>
                        <div className={styles.credentialBox}>
                            <div className={styles.credentialItem}>
                                <span>Mật khẩu sinh tự động:</span>
                                <strong className={styles.password}>{successData.generatedPassword}</strong>
                            </div>
                        </div>
                        <div className={styles.warningBox}>
                            <LockOutlined />
                            <span>Mật khẩu này chỉ được hiển thị <strong>MỘT LẦN DUY NHẤT</strong>. Quản trị viên cần lưu lại để cấp cho người đại diện.</span>
                        </div>
                        <button className={modalStyles.saveButton} onClick={handleClose}>Đã hiểu & Đóng</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={modalStyles.modalOverlay}>
            <div className={modalStyles.modalContent}>
                <div className={modalStyles.modalHeader}>
                    <h3 className={modalStyles.modalTitle}>Thêm Người đại diện (Không phải cổ đông)</h3>
                    <button
                        className={modalStyles.closeButton}
                        onClick={handleClose}
                        disabled={loading}
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={modalStyles.modalForm}>
                    <div className={styles.sectionTitle}>Thông tin người được uỷ quyền</div>
                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.required}>Họ và tên</label>
                            <div className={modalStyles.inputWithIcon}>
                                <UserOutlined className={modalStyles.inputIcon} />
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className={modalStyles.formInput}
                                />
                            </div>
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.required}>Số CCCD</label>
                            <div className={modalStyles.inputWithIcon}>
                                <IdcardOutlined className={modalStyles.inputIcon} />
                                <input
                                    type="text"
                                    required
                                    value={formData.cccd}
                                    onChange={(e) => handleInputChange('cccd', e.target.value)}
                                    placeholder="012345678901"
                                    className={modalStyles.formInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.required}>Ngày cấp CCCD</label>
                            <div className={modalStyles.inputWithIcon}>
                                <CalendarOutlined className={modalStyles.inputIcon} />
                                <input
                                    type="date"
                                    required
                                    value={formData.dateOfIssue}
                                    onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                                    className={modalStyles.formInput}
                                />
                            </div>
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.required}>Địa chỉ</label>
                            <div className={modalStyles.inputWithIcon}>
                                <EnvironmentOutlined className={modalStyles.inputIcon} />
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Hà Nội"
                                    className={modalStyles.formInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.sectionTitle}>Thông tin uỷ quyền</div>
                    <div className={modalStyles.formGroup}>
                        <label className={modalStyles.required}>Đại hội cổ đông</label>
                        <div className={modalStyles.inputWithIcon}>
                            <GlobalOutlined className={modalStyles.inputIcon} />
                            <select
                                required
                                value={formData.meetingId}
                                onChange={(e) => handleInputChange('meetingId', e.target.value)}
                                className={modalStyles.formInput}
                            >
                                <option value="">Chọn đại hội</option>
                                {meetings.map((meeting) => (
                                    <option key={meeting.id} value={meeting.id}>
                                        {meeting.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={modalStyles.formRow}>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.required}>CCCD người uỷ quyền</label>
                            <div className={modalStyles.inputWithIcon}>
                                <IdcardOutlined className={modalStyles.inputIcon} />
                                <input
                                    type="text"
                                    required
                                    value={formData.delegatorCccd}
                                    onChange={(e) => handleInputChange('delegatorCccd', e.target.value)}
                                    placeholder="Mã/CCCD cổ đông uỷ quyền"
                                    className={modalStyles.formInput}
                                />
                            </div>
                        </div>
                        <div className={modalStyles.formGroup}>
                            <label className={modalStyles.required}>Số cổ phần uỷ quyền</label>
                            <div className={modalStyles.inputWithIcon}>
                                <NumberOutlined className={modalStyles.inputIcon} />
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.sharesDelegated}
                                    onChange={(e) => handleInputChange('sharesDelegated', e.target.value)}
                                    placeholder="500"
                                    className={modalStyles.formInput}
                                />
                            </div>
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
                            {loading ? 'Đang xử lý...' : 'Thêm Người đại diện'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
