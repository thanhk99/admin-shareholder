'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Button,
    Modal,
    message,
    Spin,
    Empty,
    Card,
    Statistic,
    Row,
    Col
} from 'antd';
import {
    PlusOutlined,
    TeamOutlined,
    TrophyOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { Election } from '@/app/types/election';
import { ElectionService } from '@/lib/api/election';
import { MeetingService } from '@/lib/api/meetings';
import ElectionFormModal from './ElectionFormModal/ElectionFormModal';
import ElectionStatistics from './ElectionStatistics/ElectionStatistics';
import styles from './ElectionManagementAdmin.module.css';

export default function ElectionManagementAdmin() {
    const params = useParams();
    const router = useRouter();
    const meetingId = params.meeting as string;

    const [elections, setElections] = useState<Election[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingElection, setEditingElection] = useState<Election | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        if (meetingId) {
            fetchElections();
        }
    }, [meetingId]);

    const fetchElections = async () => {
        try {
            setLoading(true);
            // Lấy meeting details để có elections
            const meetingResponse = await MeetingService.getMeetingById(meetingId);
            const meeting = meetingResponse?.data || meetingResponse;

            // Elections đã có trong meeting response
            const electionsData = (meeting?.elections || []).sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setElections(electionsData);
        } catch (error) {
            console.error('Error fetching elections:', error);
            message.error('Không thể tải danh sách bầu cử');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingElection(null);
        setShowFormModal(true);
    };

    const handleEdit = (election: Election) => {
        setEditingElection(election);
        setShowFormModal(true);
    };

    const handleDelete = (election: Election) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: `Bạn có chắc chắn muốn xóa bầu cử "${election.title}"? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await ElectionService.deleteElection(election.id);
                    message.success('Đã xóa bầu cử thành công');
                    fetchElections();
                } catch (error) {
                    console.error('Error deleting election:', error);
                    message.error('Không thể xóa bầu cử');
                }
            },
        });
    };

    const handleManageCandidates = (electionId: string) => {
        router.push(`/candidate/${meetingId}?electionId=${electionId}`);
    };

    const boardElections = elections.filter(e => e.electionType === 'BOARD_OF_DIRECTORS');
    const supervisoryElections = elections.filter(e => e.electionType === 'SUPERVISORY_BOARD');
    const totalCandidates = elections.reduce((sum, e) => sum + (e.votingOptions?.length || 0), 0);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>
                        <TrophyOutlined /> Quản lý Bầu cử
                    </h1>
                    <p className={styles.subtitle}>
                        Quản lý các cuộc bầu cử, ứng viên và theo dõi kết quả
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleCreate}
                >
                    Tạo bầu cử mới
                </Button>
            </div>

            <Row gutter={16} className={styles.statsRow}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng số bầu cử"
                            value={elections.length}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Bầu HĐQT"
                            value={boardElections.length}
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Tổng ứng viên"
                            value={totalCandidates}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            <ElectionStatistics
                elections={elections}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageCandidates={handleManageCandidates}
            />

            <ElectionFormModal
                visible={showFormModal}
                election={editingElection}
                meetingId={meetingId}
                loading={formLoading}
                onCancel={() => {
                    setShowFormModal(false);
                    setEditingElection(null);
                }}
                onSuccess={() => {
                    setShowFormModal(false);
                    setEditingElection(null);
                    fetchElections();
                }}
            />
        </div>
    );
}
