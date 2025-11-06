import { useState, useEffect } from 'react';
import { 
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import styles from './CandidateCard.module.css';
import { Candidate } from '@/app/types/candidate';

interface CandidateCardProps {
    candidate: Candidate;
    onEdit: (candidate: Candidate) => void;
    onDelete: (id: string) => void;
    onToggleStatus: (id: string) => void;
}

export default function CandidateCard({ 
    candidate, 
    onEdit, 
    onDelete, 
    onToggleStatus 
}: CandidateCardProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const getStatusLabel = (isActive: boolean) => {
        return isActive ? 'Đang hoạt động' : 'Đã khóa';
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? '#2ecc71' : '#e74c3c';
    };

    const formatDate = (dateString: string) => {
        if (!isClient) return dateString;
        
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatNumber = (number: number) => {
        if (!isClient) return number.toString();
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    return (
        <div className={styles.candidateCard}>
            <div className={styles.cardHeader}>
                <div className={styles.candidateBasic}>
                    <div className={styles.avatar}>
                        <UserOutlined />
                    </div>
                    <div className={styles.candidateMain}>
                        <h3>{candidate.candidateName}</h3>
                        <span className={styles.position}>{candidate.currentPosition}</span>
                    </div>
                </div>
                <div className={styles.statusBadge}>
                    <span 
                        className={styles.status}
                        style={{ backgroundColor: getStatusColor(candidate.isActive) }}
                    >
                        {getStatusLabel(candidate.isActive)}
                    </span>
                </div>
            </div>

            <div className={styles.cardBody}>
                <p className={styles.candidateInfo}>
                    {candidate.candidateInfo}
                </p>

                <div className={styles.candidateDetails}>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Mã cuộc họp:</span>
                        <span className={styles.value}>{candidate.meetingCode}</span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Số phiếu bầu:</span>
                        <span className={styles.votes} suppressHydrationWarning>
                            {formatNumber(candidate.amountVotes)} cổ phần
                        </span>
                    </div>
                    <div className={styles.detailItem}>
                        <span className={styles.label}>Ngày tạo:</span>
                        <span className={styles.value}>{formatDate(candidate.createAt)}</span>
                    </div>
                    {candidate.updateAt && (
                        <div className={styles.detailItem}>
                            <span className={styles.label}>Cập nhật:</span>
                            <span className={styles.value}>{formatDate(candidate.updateAt)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.actions}>
                    <button 
                        className={styles.viewButton}
                        onClick={() => onEdit(candidate)}
                    >
                        <EyeOutlined />
                        Xem
                    </button>
                    <button 
                        className={styles.editButton}
                        onClick={() => onEdit(candidate)}
                    >
                        <EditOutlined />
                        Sửa
                    </button>
                    <button 
                        className={candidate.isActive ? styles.deactivateButton : styles.activateButton}
                        onClick={() => onToggleStatus(candidate.id)}
                    >
                        {candidate.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                        {candidate.isActive ? 'Khóa' : 'Kích hoạt'}
                    </button>
                    <button 
                        className={styles.deleteButton}
                        onClick={() => onDelete(candidate.id)}
                    >
                        <DeleteOutlined />
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}