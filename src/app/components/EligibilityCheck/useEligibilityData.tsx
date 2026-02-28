'use client'
import { useState, useEffect, useRef } from 'react';
import { FormInstance, message, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { Shareholder } from '@/app/types/shareholder';
import { ProxyItem } from '@/app/types/proxy';
import { Meeting } from '@/app/types/meeting';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import { MeetingService } from '@/lib/api/meetings';
import ProxyService from '@/lib/api/proxy';
import { DashboardService } from '@/lib/api/dashboard';
import { AttendanceService, CheckInBundleResponse } from '@/lib/api/attendance';

const { Text } = Typography;

export function useEligibilityData(form: FormInstance) {
    const [loading, setLoading] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [summary, setSummary] = useState<any>(null);
    const [shareholdersList, setShareholdersList] = useState<Shareholder[]>([]);
    const [searchOptions, setSearchOptions] = useState<{ value: string; label: React.ReactNode; data: Shareholder }[]>([]);
    const [currentBundle, setCurrentBundle] = useState<CheckInBundleResponse | null>(null);

    const mainSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const proxySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const loadMeetingData = async (meetingId: string) => {
        setLoading(true);
        try {
            setShareholdersList([]);
            form.resetFields();

            const responseAttended = await AttendanceService.getAttendedParticipants(meetingId).catch(() => []);
            const attended = (responseAttended as any)?.data || responseAttended;

            if (Array.isArray(attended)) {
                const mappedShareholders = attended.map((a: any) => ({
                    shareholderCode: a.shareholderCode || a.userId || a.investorCode,
                    investorCode: a.investorCode,
                    cccd: a.cccd,
                    fullName: a.fullName,
                    sharesOwned: a.sharesOwned,
                    attendingShares: a.attendingShares,
                    delegatedShares: a.delegatedShares || 0,
                    receivedProxyShares: a.receivedProxyShares,
                    totalShares: a.totalShares,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }

            const summaryRes = await DashboardService.getSummary().catch(() => null);
            if (summaryRes) {
                setSummary(summaryRes);
            }

            message.info('Đã tải dữ liệu cuộc họp mới');
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu cuộc họp');
        } finally {
            setLoading(false);
        }
    };

    const fetchInitialData = async () => {
        try {
            const [meetingsRes, ongoingRes, summaryRes] = await Promise.all([
                MeetingService.getAllMeetings(),
                MeetingService.getOngoingMeeting().catch(() => null),
                DashboardService.getSummary().catch(() => null)
            ]);

            let fetchedMeetings: Meeting[] = [];
            if (Array.isArray(meetingsRes)) {
                fetchedMeetings = meetingsRes;
            } else if ((meetingsRes as any).data) {
                fetchedMeetings = (meetingsRes as any).data;
            }

            const availableMeetings = fetchedMeetings.filter((m: Meeting) => m.status !== 'COMPLETED');
            setMeetings(availableMeetings);

            let targetMeetingId = '';

            if (ongoingRes && (ongoingRes as any).id) {
                targetMeetingId = (ongoingRes as any).id;
            }

            if (!targetMeetingId && availableMeetings.length > 0) {
                const ongoingInList = availableMeetings.find(m => m.status === 'ONGOING');
                if (ongoingInList) {
                    targetMeetingId = ongoingInList.id;
                } else {
                    const upcoming = availableMeetings
                        .filter(m => m.status === 'SCHEDULED')
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

                    if (upcoming.length > 0) {
                        targetMeetingId = upcoming[0].id;
                    }
                }
            }

            if (targetMeetingId) {
                setSelectedMeetingId(targetMeetingId);
            }

            if (summaryRes) {
                setSummary(summaryRes);
            }
        } catch (error) {
            // Ignore error
        }
    };

    const fillShareholderData = (shareholder: any) => {
        const userId = shareholder.userId || shareholder.id || shareholder.shareholderCode;
        // Định danh để gửi lên backend khi xác nhận tham dự (investorCode ưu tiên, fallback sang cccd)
        const identifier = shareholder.investorCode || shareholder.cccd;

        form.setFieldsValue({
            id: userId,
            keyword: shareholder.cccd || identifier,
            investorCode: identifier,   // Dùng investorCode/cccd thực tế, không phải userId
            cccd: shareholder.cccd,
            fullName: shareholder.fullName,
            dateOfIssue: shareholder.dateOfIssue ? dayjs(shareholder.dateOfIssue) : null,
            placeOfIssue: shareholder.placeOfIssue || shareholder.address,
            sharesOwned: shareholder.sharesOwned,
            delegatedShares: shareholder.delegatedShares || 0,
            receivedProxyShares: shareholder.receivedProxyShares || 0,
            // Sử dụng giá trị attendingShares đã được tính toán từ handleBundleSearch
            // hoặc fallback về công thức nếu dùng trực tiếp
            attendingShares: shareholder.attendingShares > 0
                ? shareholder.attendingShares
                : Math.max(0, shareholder.sharesOwned - (shareholder.delegatedShares || 0) + (shareholder.receivedProxyShares || 0)),
        });

        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.pageYOffset > 0) {
                window.scrollTo(0, 0);
            }
        }, 100);
    };

    const handleBundleSearch = async (keyword: string) => {
        if (!selectedMeetingId) {
            message.error('Vui lòng chọn đại hội trước');
            return;
        }

        setLoading(true);
        try {
            const bundle = await AttendanceService.getCheckInBundle(selectedMeetingId, keyword);
            setCurrentBundle(bundle);

            // Tính số cổ phần đã uỷ quyền (đi) và nhận uỷ quyền (đến) từ proxy lists
            const delegatedShares = (bundle.outgoingProxies || [])
                .reduce((sum, p) => sum + (p.sharesDelegated || 0), 0);
            const receivedProxyShares = (bundle.incomingProxies || [])
                .reduce((sum, p) => sum + (p.sharesDelegated || 0), 0);

            // Tính attendingShares = sharesOwned - delegatedShares + receivedProxyShares
            const sharesOwned = bundle.shareholder.sharesOwned || 0;
            const effectiveAttendingShares = Math.max(0, sharesOwned - delegatedShares + receivedProxyShares);

            fillShareholderData({
                ...bundle.shareholder,
                delegatedShares,
                receivedProxyShares,
                // Nếu đã check-in thì dùng giá trị thực, chưa thì tính theo công thức
                attendingShares: bundle.shareholder.checkedInAt
                    ? bundle.shareholder.attendingShares
                    : effectiveAttendingShares
            });

            message.success('Đã tìm thấy thông tin cổ đông và các đại diện');
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Không tìm thấy cổ đông';
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickSearch = (keyword: string) => {
        if (mainSearchTimeoutRef.current) {
            clearTimeout(mainSearchTimeoutRef.current);
        }

        if (!keyword || keyword.trim().length < 1) {
            setSearchOptions([]);
            return;
        }

        mainSearchTimeoutRef.current = setTimeout(async () => {
            try {
                const response: any = await ShareholderManage.searchUsers(keyword).catch(() => null);
                const data = response?.data || response;
                const results = Array.isArray(data) ? data : (data ? [data] : []);

                const filteredResults = results.filter((sh: Shareholder) =>
                    sh.sharesOwned > 0 && (
                        sh.cccd?.toLowerCase().startsWith(keyword.toLowerCase()) ||
                        sh.investorCode?.toLowerCase().startsWith(keyword.toLowerCase()) ||
                        sh.fullName?.toLowerCase().startsWith(keyword.toLowerCase())
                    )
                ).slice(0, 10);

                const options = filteredResults.map((sh: Shareholder) => ({
                    value: sh.id,
                    label: (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong style={{ fontSize: '15px' }}>{sh.cccd}</Text>
                                <div style={{ fontSize: '12px', color: '#666' }}>{sh.fullName}</div>
                            </div>
                            <Tag color="blue">{sh.id}</Tag>
                        </div>
                    ),
                    data: sh
                }));
                setSearchOptions(options);
            } catch (error) {
                // Ignore search error
            }
        }, 300);
    };


    useEffect(() => {
        return () => {
            if (mainSearchTimeoutRef.current) {
                clearTimeout(mainSearchTimeoutRef.current);
            }
            if (proxySearchTimeoutRef.current) {
                clearTimeout(proxySearchTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedMeetingId) {
            loadMeetingData(selectedMeetingId);
        } else {
            setShareholdersList([]);
            form.resetFields();
        }
    }, [selectedMeetingId]);

    return {
        loading,
        setLoading,
        meetings,
        selectedMeetingId,
        setSelectedMeetingId,
        summary,
        setSummary,
        shareholdersList,
        setShareholdersList,
        searchOptions,
        setSearchOptions,
        fillShareholderData,
        handleQuickSearch,
        loadMeetingData,
        currentBundle,
        setCurrentBundle,
        handleBundleSearch
    };
}
