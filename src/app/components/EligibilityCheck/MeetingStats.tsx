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
        <div className={styles.section} style={{ marginBottom: 12 }}>
            <Form layout="vertical">
                <Form.Item label="Đại hội cổ đông" style={{ marginBottom: 0 }}>
                    <Select
                        size="small"
                        value={selectedMeetingId}
                        onChange={onMeetingChange}
                        className={styles.meetingSelect}
                        options={meetings.map(m => ({ label: m.title, value: m.id }))}
                    />
                </Form.Item>
            </Form>
        </div>
    );
}


