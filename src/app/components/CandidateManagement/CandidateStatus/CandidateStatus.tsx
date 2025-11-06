import { PlusOutlined, UserOutlined } from '@ant-design/icons';
import styles from './CandidateStatus.module.css';

interface CandidateStatusProps {
    type: 'loading' | 'empty';
    onAddCandidate?: () => void;
}

export default function CandidateStatus({ type, onAddCandidate }: CandidateStatusProps) {
    if (type === 'loading') {
        return (
            <div className={styles.statusContainer}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải dữ liệu ứng viên...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.statusContainer}>
            <div className={styles.emptyState}>
                <UserOutlined className={styles.icon} />
                <p>Không tìm thấy ứng viên nào</p>
                {onAddCandidate && (
                    <button 
                        className={styles.addButton}
                        onClick={onAddCandidate}
                    >
                        <PlusOutlined />
                        Thêm ứng viên đầu tiên
                    </button>
                )}
            </div>
        </div>
    );
}