import { useState, useEffect } from 'react';
import {
    EditOutlined,
    DeleteOutlined,
    UserOutlined
} from '@ant-design/icons';
import styles from './CandidateCard.module.css';
import { Candidate } from '@/app/types/candidate';

interface CandidateCardProps {
    candidate: Candidate;
    onEdit: (candidate: Candidate) => void;
    onDelete: (id: string) => void;
}

export default function CandidateCard({
    candidate,
    onEdit,
    onDelete
}: CandidateCardProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className={styles.candidateCard}>
            <div className={styles.cardHeader}>
                <div className={styles.candidateBasic}>
                    <div className={styles.avatar}>
                        {candidate.photoUrl ? (
                            <img src={candidate.photoUrl} alt={candidate.name} />
                        ) : (
                            <UserOutlined />
                        )}
                    </div>
                    <div className={styles.candidateMain}>
                        <h3>{candidate.name}</h3>
                        <span className={styles.position}>{candidate.position}</span>
                    </div>
                </div>
                <div className={styles.orderBadge}>
                    <span>#{candidate.displayOrder}</span>
                </div>
            </div>

            <div className={styles.cardBody}>
                {candidate.bio && (
                    <p className={styles.candidateInfo}>
                        {candidate.bio}
                    </p>
                )}

                <div className={styles.candidateDetails}>
                    {/* Can add more details here if needed */}
                </div>
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.actions}>
                    <button
                        className={styles.editButton}
                        onClick={() => onEdit(candidate)}
                    >
                        <EditOutlined />
                        Sửa
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
