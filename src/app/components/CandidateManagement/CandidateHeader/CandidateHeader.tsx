import { PlusOutlined } from '@ant-design/icons';
import styles from './CandidateHeader.module.css';

interface CandidateHeaderProps {
    meetingCode: string;
    onAddCandidate: () => void;
}

export default function CandidateHeader({ meetingCode, onAddCandidate }: CandidateHeaderProps) {
    return (
        <div className={styles.header}>
            <div>
                <h1>Quản lý Ứng viên HĐQT</h1>
                <p>Quản lý danh sách ứng viên tham gia bầu cử Hội đồng Quản trị</p>
                <p className={styles.meetingInfo}>Mã cuộc họp: <strong>{meetingCode}</strong></p>
            </div>
            <button 
                className={styles.addButton}
                onClick={onAddCandidate}
            >
                <PlusOutlined />
                Thêm Ứng viên
            </button>
        </div>
    );
}