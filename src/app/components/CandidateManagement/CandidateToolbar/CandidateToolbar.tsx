import { useState, useEffect } from 'react';
import { 
    SearchOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import styles from './CandidateToolbar.module.css';
import { Candidate } from '@/app/types/candidate';

interface CandidateToolbarProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    candidates: Candidate[];
}

export default function CandidateToolbar({ 
    searchTerm, 
    onSearchChange, 
    candidates 
}: CandidateToolbarProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const formatNumber = (number: number) => {
        if (!isClient) return number.toString();
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.amountVotes, 0);
    const activeCandidates = candidates.filter(c => c.isActive).length;
    const inactiveCandidates = candidates.filter(c => !c.isActive).length;

    return (
        <div className={styles.toolbar}>
            <div className={styles.searchBox}>
                <SearchOutlined />
                <input
                    type="text"
                    placeholder="Tìm kiếm ứng viên theo tên hoặc vị trí..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className={styles.stats}>
                <span className={styles.statItem}>
                    <TeamOutlined />
                    Tổng: {candidates.length} ứng viên
                </span>
                <span className={styles.statItem}>
                    <CheckCircleOutlined style={{ color: '#2ecc71' }} />
                    Đang hoạt động: {activeCandidates}
                </span>
                <span className={styles.statItem}>
                    <CloseCircleOutlined style={{ color: '#e74c3c' }} />
                    Đã khóa: {inactiveCandidates}
                </span>
                <span className={styles.statItem} suppressHydrationWarning>
                    <BarChartOutlined />
                    Tổng phiếu: {formatNumber(totalVotes)}
                </span>
            </div>
        </div>
    );
}