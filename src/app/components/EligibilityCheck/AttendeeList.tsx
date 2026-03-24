'use client'

import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Card, Typography, Tag, Space, message } from 'antd';
import { SearchOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { AttendanceService } from '@/lib/api/attendance';
import { MeetingService } from '@/lib/api/meetings';
import { DashboardService } from '@/lib/api/dashboard';
import { DashboardStatsResponse } from '@/app/types/dashboard';
import { useRouter } from 'next/navigation';
import styles from './EligibilityCheck.module.css';

const { Title, Text } = Typography;

export default function AttendeeList() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [searchText, setSearchText] = useState('');
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [meetingTitle, setMeetingTitle] = useState('');
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

    const fetchMeeting = async () => {
        try {
            const ongoing = await MeetingService.getOngoingMeeting().catch(() => null);
            if (ongoing && (ongoing as any).id) {
                setSelectedMeetingId((ongoing as any).id);
                setMeetingTitle((ongoing as any).title);
                loadAttendees((ongoing as any).id);
            } else {
                const meetingsRes = await MeetingService.getAllMeetings();
                const list = (meetingsRes as any).data || meetingsRes;
                if (Array.isArray(list) && list.length > 0) {
                    const latest = list[0];
                    setSelectedMeetingId(latest.id);
                    setMeetingTitle(latest.title);
                    loadAttendees(latest.id);
                }
            }
        } catch (error) {
            message.error('Lỗi khi tải thông tin đại hội');
        }
    };

    useEffect(() => {
        fetchMeeting();
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
                <Space>
                    <UserOutlined />
                    <Text strong>{text}</Text>
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
            title: 'Số cổ phần',
            dataIndex: 'attendingShares',
            key: 'attendingShares',
            render: (val: number) => <Text strong>{val?.toLocaleString()}</Text>
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
                        Danh sách tham dự: <Text type="secondary" style={{ fontSize: '16px' }}>{meetingTitle}</Text>
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
                            {summary?.userStats?.participationRate ? (summary.userStats.participationRate * 100).toFixed(2) : '0.00'}%
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
                    onRow={(record) => ({
                        onClick: () => router.push(`/profile/${record.userId}`),
                        style: { cursor: 'pointer' }
                    })}
                    pagination={{ pageSize: 10 }}
                />
            </Space>
        </Card>
    );
}
