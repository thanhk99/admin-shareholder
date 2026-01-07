import { Modal, Table, Progress, Button, Spin, Empty } from 'antd';
import { useEffect, useState } from 'react';
import { TrophyOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import { Election } from '@/app/types/election';
import { ElectionService } from '@/lib/api/election';
import styles from './ElectionResultsModal.module.css';

interface ElectionResultsModalProps {
    isOpen: boolean;
    election: Election | null;
    onClose: () => void;
}

interface ResultItem {
    votingOptionId: string;
    votingOptionName: string;
    candidateName?: string;
    voteCount: number;
    totalWeight: number;
    percentage: number;
}

interface ElectionResultData {
    totalVoters: number;
    totalWeight: number;
    results: ResultItem[];
}

export default function ElectionResultsModal({
    isOpen,
    election,
    onClose
}: ElectionResultsModalProps) {
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState<ElectionResultData | null>(null);

    const fetchResults = async () => {
        if (!election) return;

        try {
            setLoading(true);
            const res = await ElectionService.getResults(election.id);
            if (res && (res as any).data) {
                setResultData((res as any).data);
            } else {
                setResultData(res as any);
            }
        } catch (error) {
            console.error('Failed to fetch election results:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && election) {
            fetchResults();
        } else {
            setResultData(null);
        }
    }, [isOpen, election]);

    const columns = [
        {
            title: 'Ứng viên',
            dataIndex: 'votingOptionName',
            key: 'votingOptionName',
            render: (text: string, record: ResultItem) => (
                <div className={styles.candidateName}>
                    <UserOutlined /> {text || record.candidateName || 'N/A'}
                </div>
            ),
        },
        {
            title: 'Số phiếu',
            dataIndex: 'voteCount',
            key: 'voteCount',
            align: 'center' as const,
            sorter: (a: ResultItem, b: ResultItem) => a.voteCount - b.voteCount,
        },
        {
            title: 'Tỷ lệ',
            dataIndex: 'percentage',
            key: 'percentage',
            render: (percent: number) => (
                <div style={{ width: 150 }}>
                    <Progress percent={percent} size="small" status="active" />
                </div>
            ),
            sorter: (a: ResultItem, b: ResultItem) => a.percentage - b.percentage,
        },
    ];

    return (
        <Modal
            title={
                <div className={styles.modalTitle}>
                    <TrophyOutlined /> Kết quả Bầu cử: {election?.title}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
                <Button
                    key="refresh"
                    type="primary"
                    icon={<ReloadOutlined />}
                    onClick={fetchResults}
                    loading={loading}
                >
                    Làm mới
                </Button>
            ]}
            width={700}
            centered
        >
            {loading && !resultData ? (
                <div className={styles.loadingContainer}>
                    <Spin tip="Đang tải kết quả..." />
                </div>
            ) : resultData ? (
                <div className={styles.resultsContainer}>
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Tổng người bầu:</span>
                            <span className={styles.summaryValue}>{resultData.totalVoters}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Tổng cổ phần:</span>
                            <span className={styles.summaryValue}>{resultData.totalWeight?.toLocaleString()}</span>
                        </div>
                    </div>

                    <Table
                        dataSource={resultData.results}
                        columns={columns}
                        rowKey="votingOptionId"
                        pagination={false}
                        scroll={{ y: 300 }}
                    />
                </div>
            ) : (
                <Empty description="Chưa có dữ liệu kết quả" />
            )}
        </Modal>
    );
}
