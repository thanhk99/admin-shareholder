'use client'

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Typography, Tag, Space, message, Select } from 'antd';
import { SearchOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AttendanceService } from '@/lib/api/attendance';
import { MeetingService } from '@/lib/api/meetings';
import { DashboardService } from '@/lib/api/dashboard';
import { DashboardStatsResponse } from '@/app/types/dashboard';
import { useRouter } from 'next/navigation';
import styles from './EligibilityCheck.module.css';
import { Shareholder } from '@/app/types/shareholder';

const { Title, Text } = Typography;

export default function AttendeeList() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [meetingTitle, setMeetingTitle] = useState('');
    const [meetings, setMeetings] = useState<any[]>([]);
    const [summary, setSummary] = useState<DashboardStatsResponse | null>(null);

    const loadAttendees = async (meetingId: string) => {
        setLoading(true);
        try {
            const [attendanceRes, dashboardRes] = await Promise.all([
                AttendanceService.getAttendedParticipants(meetingId),
                DashboardService.getSummary().catch(() => null)
            ]);

            const data = (attendanceRes as any)?.data || attendanceRes;
            if (Array.isArray(data)) {
                setAttendees(data);
            }

            if (dashboardRes) {
                setSummary(dashboardRes);
            }
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const fetchMeetings = async () => {
        try {
            const meetingsRes = await MeetingService.getAllMeetings();
            const list = (meetingsRes as any).data || meetingsRes;
            if (Array.isArray(list)) {
                setMeetings(list);
            }

            const ongoing = await MeetingService.getOngoingMeeting().catch(() => null);
            if (ongoing && (ongoing as any).id) {
                setSelectedMeetingId((ongoing as any).id);
                setMeetingTitle((ongoing as any).title);
                loadAttendees((ongoing as any).id);
            } else if (Array.isArray(list) && list.length > 0) {
                const latest = list[0];
                setSelectedMeetingId(latest.id);
                setMeetingTitle(latest.title);
                loadAttendees(latest.id);
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách đại hội');
        }
    };

    const handleMeetingChange = (id: string) => {
        setSelectedMeetingId(id);
        const meeting = meetings.find(m => m.id === id);
        if (meeting) setMeetingTitle(meeting.title);
        loadAttendees(id);
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const filteredAttendees = attendees.filter(a =>
        a.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        a.cccd?.includes(searchText) ||
        a.investorCode?.includes(searchText)
    );

    const columns = [
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text: string, record: any) => (
                <Space 
                    className={styles.clickableName} 
                    onClick={() => router.push(`/profile/${record.userId}`)}
                >
                    <UserOutlined />
                    <Text strong className={styles.nameLink}>{text}</Text>
                </Space>
            )
        },
        {
            title: 'CCCD',
            dataIndex: 'cccd',
            key: 'cccd',
        },
        {
            title: 'Loại hình',
            dataIndex: 'participationType',
            key: 'participationType',
            render: (type: string) => (
                <Tag color={type === 'PROXY' ? 'orange' : 'blue'}>
                    {type === 'PROXY' ? 'ỦY QUYỀN' : 'TRỰC TIẾP'}
                </Tag>
            )
        },
        {
            title: 'Quyền biểu quyết',
            dataIndex: 'attendingShares',
            key: 'attendingShares',
            render: (val: number, record: Shareholder) => {
                const total = (val + record.receivedProxyShares)
                return <Text strong>{total?.toLocaleString()}</Text>
            }
        },
        {
            title: 'Thời gian điểm danh',
            dataIndex: 'checkedInAt',
            key: 'checkedInAt',
            render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '-'
        },
        {
            title: 'Người xác nhận',
            dataIndex: 'checkedInByName',
            key: 'checkedInByName',
            render: (name: string) => <Tag color="cyan">{name || 'N/A'}</Tag>
        }
    ];

    return (
        <Card
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Danh sách tham dự:
                        <Select
                            value={selectedMeetingId}
                            onChange={handleMeetingChange}
                            style={{ marginLeft: '12px', minWidth: '300px' }}
                            placeholder="Chọn đại hội"
                        >
                            {meetings.map(m => (
                                <Select.Option key={m.id} value={m.id}>{m.title}</Select.Option>
                            ))}
                        </Select>
                    </Title>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push('/eligibility-check')}
                    >
                        Quay lại tra cứu
                    </Button>
                </div>
            }
            className={styles.section}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Tổng số cổ đông</div>
                        <div className={styles.statValue}>{summary?.userStats?.totalShareholders?.toLocaleString() || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Tổng số cổ phần</div>
                        <div className={styles.statValue}>{summary?.userStats?.totalSharesRepresented?.toLocaleString() || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Số người tham dự</div>
                        <div className={`${styles.statValue} ${styles.statValueGreen}`}>{summary?.userStats?.attendedCount?.toLocaleString() || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Số cổ đông tham dự</div>
                        <div className={`${styles.statValue} ${styles.statValueGreen}`}>{summary?.userStats?.totalShareholderCount?.toLocaleString() || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Cổ phần tham dự</div>
                        <div className={`${styles.statValue} ${styles.statValueGreen}`}>{summary?.userStats?.attendedShares?.toLocaleString() || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Tỷ lệ tham dự</div>
                        <div className={`${styles.statValue} ${styles.statValueGreen}`}>
                            {summary?.userStats?.participationRate ? (summary.userStats.participationRate).toFixed(2) : '0.00'}%
                        </div>
                    </div>
                </div>

                <Input
                    placeholder="Tìm kiếm theo Tên, CCCD hoặc Mã CĐ..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    size="large"
                    allowClear
                />

                <Table
                    loading={loading}
                    dataSource={filteredAttendees}
                    columns={columns}
                    rowKey="investorCode"
                    onRow={(record: any) => ({
                        onClick: () => router.push(`/profile/${record.userId}`),
                        className: styles.clickableRow
                    })}
                    pagination={{ pageSize: 10 }}
                />
            </Space>
        </Card>
    );
}
