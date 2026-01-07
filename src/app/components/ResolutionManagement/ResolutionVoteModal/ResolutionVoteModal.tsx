import { useState, useEffect } from 'react';
import { Modal, Spin, InputNumber, Button, Divider, Space, Alert } from 'antd';
import {
    SendOutlined,
    SaveOutlined,
    CheckCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import styles from './ResolutionVoteModal.module.css';
import { VotingItem } from '@/app/types/resolution';
import { Candidate } from '@/app/types/candidate';
import CandidateService from '@/lib/api/candidate';
import { ResolutionService } from '@/lib/api/resolution';
import { ElectionService } from '@/lib/api/election';

interface ResolutionVoteModalProps {
    isOpen: boolean;
    votingItem: VotingItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ResolutionVoteModal({
    isOpen,
    votingItem,
    onClose,
    onSuccess
}: ResolutionVoteModalProps) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [votes, setVotes] = useState<Record<string, number>>({});
    const [totalWeight, setTotalWeight] = useState<number>(1000); // Default/Placeholder weight
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && votingItem) {
            fetchCandidates();
            // In real scenario, we would fetch user's total weight here
        }
    }, [isOpen, votingItem]);

    const fetchCandidates = async () => {
        if (!votingItem) return;
        setLoading(true);
        try {
            let list = [];

            // Nếu KHÔNG PHẢI là nghị quyết (tức là HĐQT hoặc BKS) thì lấy từ API Election (theo API 5.2)
            if (votingItem.votingType && votingItem.votingType !== 'RESOLUTION') {
                const response = await ElectionService.getElectionById(votingItem.id);
                const electionData = response?.data || response;
                list = electionData?.votingOptions || electionData?.candidates || [];
            } else {
                // Nếu là resolution bình thường (Nghị quyết) - Theo API 4.1 mới
                const response = await ResolutionService.getResolutionById(votingItem.id);
                const resolutionData = response?.data || response;
                list = resolutionData?.votingOptions || resolutionData?.candidates || [];
            }

            setCandidates(list);

            // Initialize votes to 0
            const initialVotes: Record<string, number> = {};
            list.forEach((c: Candidate) => {
                initialVotes[c.id] = 0;
            });
            setVotes(initialVotes);
        } catch (e) {
            console.error('Failed to fetch candidates:', e);
            setError('Không thể tải danh sách ứng viên');
        } finally {
            setLoading(false);
        }
    };

    const handleVoteChange = (candidateId: string, value: number | null) => {
        setVotes(prev => ({
            ...prev,
            [candidateId]: value || 0
        }));
    };

    const calculateTotalUsed = () => {
        return Object.values(votes).reduce((sum, v) => sum + v, 0);
    };

    const handleSubmit = async (isDraft: boolean) => {
        if (!votingItem) return;

        const totalUsed = calculateTotalUsed();
        if (totalUsed > totalWeight) {
            setError(`Tổng số quyền biểu quyết (${totalUsed}) vượt quá hạn mức (${totalWeight})`);
            return;
        }

        setSubmitting(true);
        setError(null);

        const voteData = {
            optionVotes: Object.entries(votes)
                .filter(([_, weight]) => weight > 0)
                .map(([id, weight]) => ({
                    votingOptionId: id,
                    voteWeight: weight
                }))
        };

        try {
            if (isDraft) {
                await ResolutionService.saveDraft(votingItem.id, voteData);
            } else {
                await ResolutionService.vote(votingItem.id, voteData);
            }
            onSuccess();
            onClose();
        } catch (e) {
            console.error(`Failed to ${isDraft ? 'save draft' : 'vote'}:`, e);
            setError(`Lỗi: ${isDraft ? 'Không thể lưu bản nháp' : 'Không thể gửi biểu quyết'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const totalUsed = calculateTotalUsed();
    const remaining = totalWeight - totalUsed;

    return (
        <Modal
            title={
                <Space>
                    <CheckCircleOutlined style={{ color: '#1890ff' }} />
                    <span>Thực hiện Biểu quyết: {votingItem?.title}</span>
                </Space>
            }
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={700}
            centered
        >
            <div className={styles.modalContent}>
                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 16 }}
                    />
                )}

                <div className={styles.infoSection}>
                    <div className={styles.weightBadge}>
                        <span className={styles.label}>Quyền biểu quyết của bạn:</span>
                        <span className={styles.value}>{totalWeight.toLocaleString()}</span>
                    </div>
                    <div className={styles.usageSummary}>
                        <span>Đã dùng: <strong>{totalUsed.toLocaleString()}</strong></span>
                        <span>Còn lại: <strong className={remaining < 0 ? styles.error : ''}>{remaining.toLocaleString()}</strong></span>
                    </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {loading ? (
                    <div className={styles.loading}>
                        <Spin tip="Đang tải danh sách ứng viên..." />
                    </div>
                ) : (
                    <div className={styles.candidatesList}>
                        {candidates.map(candidate => (
                            <div key={candidate.id} className={styles.candidateItem}>
                                <div className={styles.candidateInfo}>
                                    <div className={styles.candidateAvatar}>
                                        {candidate.photoUrl ? (
                                            <img src={candidate.photoUrl} alt={candidate.name} />
                                        ) : (
                                            <UserOutlined />
                                        )}
                                    </div>
                                    <div>
                                        <div className={styles.candidateName}>{candidate.name}</div>
                                        <div className={styles.candidatePosition}>{candidate.position}</div>
                                    </div>
                                </div>
                                <div className={styles.voteInput}>
                                    <InputNumber
                                        min={0}
                                        max={totalWeight}
                                        value={votes[candidate.id]}
                                        onChange={(val) => handleVoteChange(candidate.id, val)}
                                        placeholder="Số phiếu"
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value ? parseFloat(value.replace(/\$\s?|(,*)/g, '')) : 0}
                                        className={styles.pInput}
                                    />
                                </div>
                            </div>
                        ))}

                        {candidates.length === 0 && (
                            <div className={styles.noData}>
                                Chưa có ứng viên hoặc lựa chọn nào.
                            </div>
                        )}
                    </div>
                )}

                <Divider style={{ margin: '20px 0 16px' }} />

                <div className={styles.actions}>
                    <Button
                        disabled={submitting}
                        onClick={onClose}
                    >
                        Hủy
                    </Button>
                    <Space>
                        <Button
                            icon={<SaveOutlined />}
                            onClick={() => handleSubmit(true)}
                            loading={submitting && !submitting} // Simplified for demo
                            disabled={submitting || candidates.length === 0}
                        >
                            Lưu bản nháp
                        </Button>
                        <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={() => handleSubmit(false)}
                            loading={submitting}
                            disabled={submitting || candidates.length === 0 || remaining < 0}
                        >
                            Gửi Biểu quyết
                        </Button>
                    </Space>
                </div>
            </div>
        </Modal>
    );
}
