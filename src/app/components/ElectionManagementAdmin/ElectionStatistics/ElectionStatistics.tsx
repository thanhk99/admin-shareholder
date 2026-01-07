import { useEffect, useState } from 'react';
import { Table, Card, Row, Col, Progress, Spin, Empty, Button, Space, Tag, Modal } from 'antd';
import {
    TrophyOutlined,
    TeamOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Election } from '@/app/types/election';
import { ElectionService } from '@/lib/api/election';
import styles from './ElectionStatistics.module.css';

interface ElectionStatisticsProps {
    elections: Election[];
    onEdit: (election: Election) => void;
    onDelete: (election: Election) => void;
    onManageCandidates: (electionId: string) => void;
}

interface ResultItem {
    candidateId: string;
    candidateName: string;
    voteCount: number;
    percentage: number;
}

interface ElectionResultMap {
    [electionId: string]: {
        totalVoters: number;
        results: ResultItem[];
    }
}

export default function ElectionStatistics({
    elections,
    onEdit,
    onDelete,
    onManageCandidates
}: ElectionStatisticsProps) {
    const [loading, setLoading] = useState(false);
    const [resultsMap, setResultsMap] = useState<ElectionResultMap>({});

    useEffect(() => {
        fetchAllResults();
    }, [elections]);

    const fetchAllResults = async () => {
        if (!elections.length) return;

        setLoading(true);
        try {
            const results: ElectionResultMap = {};

            await Promise.all(elections.map(async (election) => {
                try {
                    const res = await ElectionService.getResults(election.id);
                    const data = (res as any).data || res;

                    if (data && data.results) {
                        results[election.id] = {
                            totalVoters: data.totalVoters,
                            results: data.results.map((r: any) => ({
                                candidateId: r.votingOptionId,
                                candidateName: r.votingOptionName || r.candidateName,
                                voteCount: r.voteCount,
                                percentage: r.percentage,
                            })).sort((a: any, b: any) => b.voteCount - a.voteCount)
                        };
                    }
                } catch (e) {
                    console.error(`Failed to fetch results for election ${election.id}`, e);
                }
            }));

            setResultsMap(results);

        } catch (error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Họ và tên ứng viên',
            dataIndex: 'candidateName',
            key: 'candidateName',
            render: (text: string) => (
                <span className={styles.candidateName}>
                    <UserOutlined /> {text}
                </span>
            )
        },
        {
            title: 'Số phiếu',
            dataIndex: 'voteCount',
            key: 'voteCount',
            width: 120,
            align: 'center' as const,
            render: (count: number) => <span className={styles.voteCount}>{count}</span>
        },
        {
            title: 'Tỷ lệ',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 200,
            render: (percent: number) => (
                <div style={{ width: 150 }}>
                    <Progress percent={percent} size="small" status="active" strokeColor={percent > 50 ? '#52c41a' : '#1890ff'} />
                </div>
            ),
        },
    ];

    const renderElectionCard = (election: Election) => {
        const result = resultsMap[election.id];

        return (
            <Col span={24} key={election.id}>
                <Card className={styles.electionCard}>
                    <div className={styles.cardHeader}>
                        <div className={styles.headerLeft}>
                            <h3 className={styles.electionTitle}>{election.title}</h3>
                            <p className={styles.electionDesc}>{election.description}</p>
                            <Tag color="purple">{election.votingOptions?.length || 0} ứng viên</Tag>
                        </div>
                        <div className={styles.headerRight}>
                            <Space>
                                <Button
                                    icon={<TeamOutlined />}
                                    onClick={() => onManageCandidates(election.id)}
                                >
                                    Ứng viên
                                </Button>
                                <Button
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit(election)}
                                >
                                    Sửa
                                </Button>
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onDelete(election)}
                                >
                                    Xóa
                                </Button>
                            </Space>
                        </div>
                    </div>

                    <div className={styles.resultSection}>
                        <Table
                            dataSource={result?.results || []}
                            columns={columns}
                            rowKey="candidateId"
                            pagination={false}
                            size="small"
                            loading={loading}
                            locale={{ emptyText: 'Chưa có ứng viên hoặc dữ liệu' }}
                        />
                    </div>
                </Card>
            </Col>
        );
    };

    const boardElections = elections.filter(e => e.electionType === 'BOARD_OF_DIRECTORS');
    const supervisoryElections = elections.filter(e => e.electionType === 'SUPERVISORY_BOARD');

    if (elections.length === 0) {
        return <Empty description="Chưa có dữ liệu bầu cử" />;
    }

    return (
        <div className={styles.container}>
            <Row gutter={[24, 24]}>
                {/* Board of Directors */}
                {boardElections.length > 0 && (
                    <Col span={24}>
                        <div className={styles.groupTitle}>
                            <TrophyOutlined style={{ color: '#faad14' }} />
                            Hội đồng Quản trị
                        </div>
                        <Row gutter={[0, 16]}>
                            {boardElections.map(renderElectionCard)}
                        </Row>
                    </Col>
                )}

                {/* Supervisory Board */}
                {supervisoryElections.length > 0 && (
                    <Col span={24}>
                        <div className={styles.groupTitle}>
                            <TeamOutlined style={{ color: '#52c41a' }} />
                            Ban Kiểm soát
                        </div>
                        <Row gutter={[0, 16]}>
                            {supervisoryElections.map(renderElectionCard)}
                        </Row>
                    </Col>
                )}
            </Row>
        </div>
    );
}
