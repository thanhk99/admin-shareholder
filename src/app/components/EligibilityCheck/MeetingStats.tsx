import { Form, Select, Row, Col, Tag } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Meeting } from '@/app/types/meeting';
import styles from './EligibilityCheck.module.css';

interface MeetingStatsProps {
    meetings: Meeting[];
    selectedMeetingId: string;
    onMeetingChange: (meetingId: string) => void;
    totalShareholders: number;
    totalShares: number;
    totalAttendees: number;
    totalShareholderCount: number;
    totalAttendingShares: number;
    participationPercent: string;
}

export default function MeetingStats({
    meetings,
    selectedMeetingId,
    onMeetingChange,
    totalShareholders,
    totalShares,
    totalAttendees,
    totalShareholderCount,
    totalAttendingShares,
    participationPercent
}: MeetingStatsProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Thông tin chung</h2>
            </div>
            <Form layout="vertical">
                <Row gutter={24}>
                    <Col span={16}>
                        <Form.Item label="Đại hội cổ đông">
                            <Select
                                value={selectedMeetingId}
                                onChange={onMeetingChange}
                                className={styles.meetingSelect}
                                options={meetings.map(m => ({ label: m.title, value: m.id }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '30px' }}>
                        <div className={styles.headerStats}>
                            <span className={styles.headerStatLabel}>Tỷ lệ tham dự:</span>
                            <span className={styles.headerStatValue}>{participationPercent}%</span>
                            {Number(participationPercent) >= 50 && (
                                <Tag color="success" icon={<CheckCircleOutlined />}>Đủ điều kiện</Tag>
                            )}
                        </div>
                    </Col>
                </Row>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Tổng số cổ đông</span>
                        <span className={styles.statValue}>
                            {totalShareholders.toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Tổng số cổ phần</span>
                        <span className={styles.statValue}>
                            {totalShares.toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Tham dự</span>
                        <span className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {totalAttendees.toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Số cổ đông</span>
                        <span className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {totalShareholderCount.toLocaleString()}
                        </span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Số cổ phần</span>
                        <span className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {totalAttendingShares.toLocaleString()}
                        </span>
                    </div>
                </div>
            </Form>
        </div>
    );
}

