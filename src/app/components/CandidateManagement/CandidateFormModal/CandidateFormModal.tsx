import styles from './CandidateFormModal.module.css';
import { CandidateFormData } from '@/app/types/candidate';

interface CandidateFormModalProps {
    showForm: boolean;
    formMode: 'create' | 'edit';
    formData: CandidateFormData;
    formLoading: boolean;
    onFormDataChange: (data: CandidateFormData) => void;
    onClose: () => void;
    onSubmit: () => void;
    meetingCode?: string; // Thêm prop meetingCode
}

export default function CandidateFormModal({
    showForm,
    formMode,
    formData,
    formLoading,
    onFormDataChange,
    onClose,
    onSubmit,
    meetingCode = '' // Giá trị mặc định
}: CandidateFormModalProps) {
    if (!showForm) return null;

    const handleInputChange = (field: keyof CandidateFormData, value: string) => {
        onFormDataChange({
            ...formData,
            [field]: value
        });
    };

    // Trong chế độ tạo mới, tự động điền meetingCode từ prop
    const displayMeetingCode = formMode === 'create' ? meetingCode : formData.meetingCode;
    const isMeetingCodeEditable = formMode === 'edit';

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h3>{formMode === 'create' ? 'Thêm Ứng viên Mới' : 'Chỉnh sửa Ứng viên'}</h3>
                    <button 
                        className={styles.closeButton}
                        onClick={onClose}
                        disabled={formLoading}
                    >
                        ×
                    </button>
                </div>
                
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onSubmit();
                }} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Tên ứng viên *</label>
                        <input
                            type="text"
                            value={formData.candidateName}
                            onChange={(e) => handleInputChange('candidateName', e.target.value)}
                            placeholder="Nhập họ tên ứng viên"
                            required
                            disabled={formLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Vị trí hiện tại *</label>
                        <input
                            type="text"
                            value={formData.currentPosition}
                            onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                            placeholder="Nhập vị trí/chức vụ hiện tại"
                            required
                            disabled={formLoading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Mã cuộc họp *</label>
                        <input
                            type="text"
                            value={displayMeetingCode}
                            onChange={(e) => {
                                if (isMeetingCodeEditable) {
                                    handleInputChange('meetingCode', e.target.value);
                                }
                            }}
                            placeholder="Nhập mã cuộc họp"
                            required
                            disabled={formLoading || !isMeetingCodeEditable}
                            readOnly={!isMeetingCodeEditable}
                            className={!isMeetingCodeEditable ? styles.readOnlyInput : ''}
                        />
                        {!isMeetingCodeEditable && (
                            <div className={styles.helperText}>
                                Mã cuộc họp được tự động điền từ cuộc họp hiện tại
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>Thông tin ứng viên</label>
                        <textarea
                            value={formData.candidateInfo}
                            onChange={(e) => handleInputChange('candidateInfo', e.target.value)}
                            placeholder="Nhập thông tin chi tiết về ứng viên (kinh nghiệm, thành tích, ...)"
                            rows={4}
                            disabled={formLoading}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <button 
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={formLoading}
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit"
                            className={styles.saveButton}
                            disabled={formLoading || !formData.candidateName || !formData.currentPosition || !displayMeetingCode}
                        >
                            {formLoading ? 'Đang xử lý...' : formMode === 'create' ? 'Thêm' : 'Cập nhật'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}