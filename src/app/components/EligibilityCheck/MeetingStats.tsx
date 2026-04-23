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
        <div className={styles.section} style={{ marginBottom: 4, padding: '4px 16px' }}>
            <Form layout="inline">
                <Form.Item label={<span style={{ fontSize: 13, fontWeight: 500 }}>Đại hội:</span>} style={{ marginBottom: 0, marginRight: 0, flex: 1 }}>
                    <Select
                        size="small"
                        value={selectedMeetingId}
                        onChange={onMeetingChange}
                        className={styles.meetingSelect}
                        style={{ width: '100%' }}
                        options={meetings.map(m => ({ label: m.title, value: m.id }))}
                        tabIndex={-1}
                    />
                </Form.Item>
            </Form>
        </div>
    );
}


