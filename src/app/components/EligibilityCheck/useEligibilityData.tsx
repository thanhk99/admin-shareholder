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
import { AttendanceService } from '@/lib/api/attendance';

const { Text } = Typography;

export function useEligibilityData(form: FormInstance) {
    const [loading, setLoading] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [summary, setSummary] = useState<any>(null);
    const [shareholdersList, setShareholdersList] = useState<Shareholder[]>([]);
    const [proxyList, setProxyList] = useState<ProxyItem[]>([]);
    const [searchOptions, setSearchOptions] = useState<{ value: string; label: React.ReactNode; data: Shareholder }[]>([]);
    const [proxySearchOptions, setProxySearchOptions] = useState<{ value: string; label: React.ReactNode; data: Shareholder }[]>([]);
    const [selectedProxyId, setSelectedProxyId] = useState<number | null>(null);
    const [proxyUserId, setProxyUserId] = useState<string | null>(null);

    const mainSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const proxySearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const loadMeetingData = async (meetingId: string) => {
        setLoading(true);
        try {
            setProxyList([]);
            setShareholdersList([]);
            form.resetFields();

            const response = await ProxyService.getMeetingProxies(meetingId);
            const proxies = (response as any)?.data || response;
            if (Array.isArray(proxies)) {
                setProxyList(proxies);
            }

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

    const fillShareholderData = (shareholder: any, existingProxy?: ProxyItem) => {
        const userId = shareholder.id || shareholder.userId || shareholder.shareholderCode;
        const displayCode = userId;

        form.setFieldsValue({
            id: userId,
            keyword: shareholder.cccd || displayCode,
            investorCode: displayCode,
            cccd: shareholder.cccd,
            fullName: shareholder.fullName,
            dateOfIssue: shareholder.dateOfIssue ? dayjs(shareholder.dateOfIssue) : null,
            placeOfIssue: shareholder.placeOfIssue || shareholder.address,
            sharesOwned: shareholder.sharesOwned,
            attendingShares: shareholder.attendingShares !== undefined ? shareholder.attendingShares : shareholder.sharesOwned,
        });

        if (existingProxy) {
            setSelectedProxyId(existingProxy.id);
            setProxyUserId(existingProxy.proxyId);
            form.setFieldsValue({
                isProxy: true,
                proxyId: existingProxy.proxyId,
                proxyUserId: existingProxy.proxyId,
                proxyFullName: existingProxy.proxyName,
                proxyShares: existingProxy.sharesDelegated
            });
        } else {
            setSelectedProxyId(null);
            setProxyUserId(null);
            const foundProxy = proxyList.find(p =>
                String(p.delegatorId) === String(shareholder.id) ||
                String(p.delegatorId) === String(shareholder.investorCode)
            );
            if (foundProxy) {
                setSelectedProxyId(foundProxy.id);
                setProxyUserId(foundProxy.proxyId);
                form.setFieldsValue({
                    isProxy: true,
                    proxyId: foundProxy.proxyId,
                    proxyUserId: foundProxy.proxyId,
                    proxyFullName: foundProxy.proxyName,
                    proxyShares: foundProxy.sharesDelegated
                });
            } else {
                form.setFieldsValue({
                    isProxy: false,
                    proxyId: '',
                    proxyUserId: '',
                    proxyFullName: '',
                    proxyDateOfIssue: undefined,
                    proxyPlaceOfIssue: '',
                    proxyShares: ''
                });
            }
        }

        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (window.pageYOffset > 0) {
                window.scrollTo(0, 0);
            }
        }, 100);
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

    const handleProxyQuickSearch = (keyword: string) => {
        if (proxySearchTimeoutRef.current) {
            clearTimeout(proxySearchTimeoutRef.current);
        }

        if (!keyword || keyword.trim().length < 1) {
            setProxySearchOptions([]);
            return;
        }

        proxySearchTimeoutRef.current = setTimeout(async () => {
            try {
                const currentId = form.getFieldValue('investorCode');
                const currentCCCD = form.getFieldValue('cccd');

                const response: any = await ShareholderManage.searchUsers(keyword).catch(() => null);
                const data = response?.data || response;
                const results = Array.isArray(data) ? data : (data ? [data] : []);

                const filteredResults = results.filter((sh: Shareholder) => {
                    const isSelf = (sh.id && sh.id === currentId) ||
                        (sh.cccd && sh.cccd === currentCCCD);

                    if (isSelf) return false;

                    return sh.cccd?.toLowerCase().startsWith(keyword.toLowerCase()) ||
                        sh.id?.toLowerCase().startsWith(keyword.toLowerCase());
                }).slice(0, 10);

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
                setProxySearchOptions(options);
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
            setProxyList([]);
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
        proxyList,
        setProxyList,
        searchOptions,
        setSearchOptions,
        proxySearchOptions,
        setProxySearchOptions,
        selectedProxyId,
        setSelectedProxyId,
        proxyUserId,
        setProxyUserId,
        fillShareholderData,
        handleQuickSearch,
        handleProxyQuickSearch,
        loadMeetingData
    };
}
