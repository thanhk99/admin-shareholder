'use client';

import '@ant-design/v5-patch-for-react-19';

import { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    Card,
    Checkbox,
    Row,
    Col,
    Table,
    Tag,
    Space,
    Typography,
    Divider,
    message,
    AutoComplete,
    DatePicker
} from 'antd';
import dayjs from 'dayjs';
import {
    SearchOutlined,
    ReloadOutlined,
    SaveOutlined,
    DeleteOutlined,
    TeamOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    QrcodeOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import styles from './EligibilityCheck.module.css';

import { Shareholder } from '@/app/types/shareholder';
import { ProxyItem, ProxyRequest } from '@/app/types/proxy';
import { Meeting } from '@/app/types/meeting';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import { MeetingService } from '@/lib/api/meetings';
import ProxyService from '@/lib/api/proxy';
import { DashboardService } from '@/lib/api/dashboard';
import { AttendanceService } from '@/lib/api/attendance';

const { Title, Text } = Typography;
const { Option } = Select;

export default function EligibilityCheck() {
    const [form] = Form.useForm();
    const [isProxy, setIsProxy] = useState(false);
    const [loading, setLoading] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
    const [summary, setSummary] = useState<any>(null);

    const attendingSharesWatch = Form.useWatch('attendingShares', form);
    const sharesOwnedWatch = Form.useWatch('sharesOwned', form);
    const investorCodeWatch = Form.useWatch('investorCode', form);



    const [shareholdersList, setShareholdersList] = useState<Shareholder[]>([]);
    const [proxyList, setProxyList] = useState<ProxyItem[]>([]);
    const [searchOptions, setSearchOptions] = useState<{ value: string; label: React.ReactNode; data: Shareholder }[]>([]);
    const [proxySearchOptions, setProxySearchOptions] = useState<{ value: string; label: React.ReactNode; data: Shareholder }[]>([]);
    const [mainSearchTimeout, setMainSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [proxySearchTimeout, setProxySearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [selectedProxyId, setSelectedProxyId] = useState<number | null>(null);
    const [proxyUserId, setProxyUserId] = useState<string | null>(null);

    const alreadyDelegatedCount = proxyList
        .filter(p => p.delegatorId === investorCodeWatch)
        .reduce((sum, p) => sum + (Number(p.sharesDelegated) || 0), 0);

    const remainingToAllocate = (Number(sharesOwnedWatch) || 0) - (Number(attendingSharesWatch) || 0) - alreadyDelegatedCount;
    const displayRemaining = Math.max(0, remainingToAllocate);

    const totalShareholders = summary?.userStats?.totalShareholders || 0;
    const totalShares = summary?.userStats?.totalSharesRepresented || 0;
    const directAttendees = summary?.meetingStats?.totalInvited || 0;

    const uniqueAttendees = new Set<string>();
    shareholdersList.forEach(s => {
        const key = s.cccd || s.investorCode;
        if (key) uniqueAttendees.add(key);
    });
    proxyList.forEach(p => {
        if (p.proxyId) uniqueAttendees.add(p.proxyId);
    });
    const verifiedAttendees = uniqueAttendees.size;

    const uniqueProxyRecipients = proxyList.length > 0 ? new Set(proxyList.map(p => p.proxyId)).size : 0;

    const totalProxyDelegations = proxyList.length;

    const totalLocalDirectShares = shareholdersList.reduce((sum, sh) => sum + (Number((sh as any).attendingShares) || 0), 0);
    const totalLocalProxyShares = proxyList.reduce((sum, p) => sum + (Number(p.sharesDelegated) || 0), 0);
    const totalAttendingShares = totalLocalDirectShares + totalLocalProxyShares;

    const participationPercent = totalShares > 0 ? ((totalAttendingShares / totalShares) * 100).toFixed(2) : '0.00';

    const shareholderColumns = [
        { title: 'Mã CĐ', dataIndex: 'investorCode', key: 'investorCode' },
        { title: 'Số CMND/Hộ...', dataIndex: 'cccd', key: 'cccd' },
        { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Tổng sở hữu', dataIndex: 'totalOwned', key: 'totalOwned', render: (val: number) => val?.toLocaleString() },
        { title: 'SL Tham dự', dataIndex: 'attendingShares', key: 'attendingShares', render: (val: number) => val?.toLocaleString() },
        { title: 'SPCP được UQ', dataIndex: 'receivedProxyShares', key: 'receivedProxyShares', render: (val: number) => val?.toLocaleString() },
    ];

    const proxyColumns = [
        { title: 'Người nhận UQ', dataIndex: 'proxyId', key: 'proxyId' },
        { title: 'Họ tên người nhận UQ', dataIndex: 'proxyName', key: 'proxyName' },
        { title: 'Mã người UQ', dataIndex: 'delegatorId', key: 'delegatorId' },
        { title: 'Họ tên người UQ', dataIndex: 'delegatorName', key: 'delegatorName' },
        { title: 'Số lượng UQ', dataIndex: 'sharesDelegated', key: 'sharesDelegated', render: (val: number) => val?.toLocaleString() },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (val: string) => <Tag color={val === 'ACTIVE' ? 'green' : 'red'}>{val}</Tag> },
    ];

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
            setIsProxy(false);
        }
    }, [selectedMeetingId]);

    const loadMeetingData = async (meetingId: string) => {
        setLoading(true);
        try {
            // Reset state
            setProxyList([]);
            setShareholdersList([]);
            form.resetFields();
            setIsProxy(false);

            // Fetch proxies for this meeting
            const proxies = await ProxyService.getMeetingProxies(meetingId);
            if (Array.isArray(proxies)) {
                setProxyList(proxies);
            }

            // Fetch attended participants for this meeting
            const attended = await AttendanceService.getAttendedParticipants(meetingId).catch(() => []);
            if (Array.isArray(attended)) {
                // Map AttendanceResponse to Shareholder structure for the table
                const mappedShareholders = attended.map(a => ({
                    investorCode: a.investorCode,
                    cccd: a.cccd,
                    fullName: a.fullName,
                    totalOwned: a.sharesOwned,
                    attendingShares: a.attendingShares,
                    receivedProxyShares: a.receivedProxyShares,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }

            // Also reload summary for the meeting context if possible
            const summaryRes = await DashboardService.getSummary().catch(() => null);
            if (summaryRes) {
                setSummary(summaryRes);
            }

            message.info('Đã tải dữ liệu cuộc họp mới');
        } catch (error) {
            console.error('Error loading meeting data:', error);
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
            console.error('Error fetching initial data:', error);
        }
    };

    const handleConfirmAttendance = async () => {
        const values = form.getFieldsValue();
        if (!values.investorCode) {
            message.warning('Vui lòng tìm kiếm cổ đông trước');
            return;
        }

        const attendingShares = Number(values.attendingShares) || 0;
        const totalOwned = Number(values.sharesOwned) || 0;

        if (attendingShares < 0) {
            message.error('Số lượng tham dự không được là số âm');
            return;
        }

        if (attendingShares > totalOwned) {
            message.error('Số lượng tham dự không được vượt quá số cổ phần sở hữu');
            return;
        }

        setLoading(true);
        try {
            const response = await AttendanceService.registerAttendance({
                meetingId: selectedMeetingId,
                investorCode: values.investorCode,
                attendingShares: attendingShares,
                participationType: 'DIRECT'
            });

            const newEntry = {
                investorCode: response.investorCode,
                cccd: response.cccd,
                fullName: response.fullName,
                totalOwned: response.sharesOwned,
                attendingShares: response.attendingShares,
                receivedProxyShares: response.receivedProxyShares,
                id: response.userId
            };

            setShareholdersList(prev => {
                const index = prev.findIndex(s => s.investorCode === response.investorCode);
                if (index > -1) {
                    const newList = [...prev];
                    newList[index] = newEntry as any;
                    return newList;
                }
                return [newEntry as any, ...prev];
            });

            message.success('Xác nhận số lượng tham dự thành công');
        } catch (error: any) {
            console.error('Error confirming attendance:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
            message.error(`Lỗi khi xác nhận tham dự: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProxy = async () => {
        const values = form.getFieldsValue();

        // Use values.proxyUserId or values.proxyId (if it's already an ID)
        const effectiveProxyId = values.proxyUserId || values.proxyId;

        if (!effectiveProxyId || !values.proxyFullName) {
            message.warning('Vui lòng tìm kiếm và chọn người nhận ủy quyền từ danh sách gợi ý');
            return;
        }

        if (!selectedMeetingId) {
            message.error('Vui lòng chọn đại hội trước');
            return;
        }

        const delegatorDbId = values.id || values.investorCode;
        if (!delegatorDbId) {
            message.error('Thiếu thông tin người ủy quyền');
            return;
        }

        const sharesOwned = Number(values.sharesOwned) || 0;
        const attendingShares = Number(values.attendingShares) || 0;

        // Detect if this pair already exists (to implement "overwrite")
        const existingPairProxy = proxyList.find(p =>
            String(p.delegatorId) === String(delegatorDbId) &&
            String(p.proxyId) === String(effectiveProxyId) &&
            p.status === 'ACTIVE'
        );

        // Record to revoke: either the one we explicitly selected for editing, 
        // or the one that already exists for this pair (auto-overwrite)
        const proxyToRevokeId = selectedProxyId || existingPairProxy?.id;

        const totalDelegated = proxyList
            .filter(p => String(p.delegatorId) === String(values.investorCode) || String(p.delegatorId) === String(values.id))
            .reduce((sum, p) => sum + (Number(p.sharesDelegated) || 0), 0);

        // When calculating remaining shares, we must subtract the shares of the record we are about to replace
        const proxyToReplace = proxyList.find(p => p.id === proxyToRevokeId);
        const delegatedExcludingCurrent = proxyToReplace
            ? totalDelegated - (Number(proxyToReplace.sharesDelegated) || 0)
            : totalDelegated;

        const remainingShares = sharesOwned - attendingShares - delegatedExcludingCurrent;

        let delegateAmount = values.proxyShares;
        if (!delegateAmount || delegateAmount === '') {
            delegateAmount = remainingShares;
        } else {
            delegateAmount = Number(delegateAmount);
        }

        if (delegateAmount <= 0) {
            message.error('Số lượng ủy quyền phải lớn hơn 0');
            return;
        }

        if (delegateAmount > remainingShares) {
            message.error(`Số lượng ủy quyền (${delegateAmount.toLocaleString()}) vượt quá số cổ phần khả dụng (${remainingShares.toLocaleString()})`);
            return;
        }

        setLoading(true);
        try {
            // Revoke the old record (overwrite logic)
            if (proxyToRevokeId) {
                try {
                    await ProxyService.revokeProxy(selectedMeetingId, proxyToRevokeId);
                    console.log('Revoked existing proxy for overwrite:', proxyToRevokeId);
                } catch (revokeError) {
                    console.warn('Failed to revoke old proxy, current create might fail:', revokeError);
                }
            }

            // Call API to create proxy with the NEW amount
            const proxyRequest: ProxyRequest = {
                delegatorId: delegatorDbId,
                proxyId: effectiveProxyId,
                sharesDelegated: delegateAmount
            };

            console.log('Saving proxy (overwrite):', proxyRequest);

            const createdProxy = await ProxyService.createProxy(selectedMeetingId, proxyRequest);
            console.log('Proxy saved successfully:', createdProxy);

            message.success(proxyToRevokeId ? `Đã cập nhật (ghi đè) thông tin ủy quyền thành công` : `Lưu thông tin ủy quyền thành công`);

            // Build the new proxy item for local display
            const newProxy: ProxyItem = {
                ...createdProxy,
                proxyName: values.proxyFullName,
                delegatorName: values.fullName,
                delegatorId: delegatorDbId
            } as ProxyItem;

            setProxyList(prev => {
                // Remove the old row(s) to avoid duplicates and reflect overwrite
                let newList = prev.filter(p => p.id !== proxyToRevokeId);
                return [newProxy, ...newList];
            });

            // Refresh attended list as proxy impacts share counts
            const attended = await AttendanceService.getAttendedParticipants(selectedMeetingId).catch(() => []);
            if (Array.isArray(attended)) {
                const mappedShareholders = attended.map(a => ({
                    investorCode: a.investorCode,
                    cccd: a.cccd,
                    fullName: a.fullName,
                    totalOwned: a.sharesOwned,
                    attendingShares: a.attendingShares,
                    receivedProxyShares: a.receivedProxyShares,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }

            // Refresh summary
            const summaryRes = await DashboardService.getSummary().catch(() => null);
            if (summaryRes) {
                setSummary(summaryRes);
            }

            // Reset proxy fields
            setSelectedProxyId(null);
            setProxyUserId(null);
            form.setFieldsValue({
                isProxy: false,
                proxyId: '',
                proxyUserId: '',
                proxyFullName: '',
                proxyDateOfIssue: null,
                proxyPlaceOfIssue: '',
                proxyShares: ''
            });
            setIsProxy(false);
        } catch (error: any) {
            console.error('Error saving proxy:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định từ máy chủ';
            message.error(`Lỗi khi lưu thông tin ủy quyền: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteProxy = async () => {
        if (!selectedProxyId) {
            message.warning('Vui lòng chọn lượt ủy quyền cần xóa từ danh sách bên dưới');
            return;
        }

        if (!selectedMeetingId) {
            message.error('Không xác định được đai hội');
            return;
        }

        setLoading(true);
        try {
            await ProxyService.revokeProxy(selectedMeetingId, selectedProxyId);
            message.success('Đã xóa lượt ủy quyền thành công');

            // Update local list
            setProxyList(prev => prev.filter(p => p.id !== selectedProxyId));

            // Refresh attended list
            const attended = await AttendanceService.getAttendedParticipants(selectedMeetingId).catch(() => []);
            if (Array.isArray(attended)) {
                const mappedShareholders = attended.map(a => ({
                    investorCode: a.investorCode,
                    cccd: a.cccd,
                    fullName: a.fullName,
                    totalOwned: a.sharesOwned,
                    attendingShares: a.attendingShares,
                    receivedProxyShares: a.receivedProxyShares,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }

            // Refresh summary
            const summaryRes = await DashboardService.getSummary().catch(() => null);
            if (summaryRes) {
                setSummary(summaryRes);
            }

            // Reset proxy part of form
            setSelectedProxyId(null);
            form.setFieldsValue({
                isProxy: false,
                proxyId: '',
                proxyFullName: '',
                proxyDateOfIssue: undefined,
                proxyPlaceOfIssue: '',
                proxyShares: ''
            });
            setIsProxy(false);
        } catch (error) {
            console.error('Error deleting proxy:', error);
            message.error('Lỗi khi xóa lượt ủy quyền');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F11') {
                e.preventDefault();
                message.info('Mở danh sách tham dự trực tiếp');
            } else if (e.key === 'F12') {
                e.preventDefault();
                message.info('Mở danh sách cổ đông tham dự');
            } else if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                handleSaveProxy();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleQRScan = () => {
        message.info('Tính năng quét QR đang được khởi tạo. Vui lòng kết nối camera.');
    };

    const handlePrintQR = async () => {
        const investorCode = form.getFieldValue('investorCode');
        const userId = form.getFieldValue('id'); // Assuming shareholder has an id field

        if (!investorCode) {
            message.warning('Vui lòng tìm kiếm cổ đông trước khi in mã QR');
            return;
        }

        try {
            const response = await ShareholderManage.generateQrLogin(userId || investorCode);

            if (response && (response as any).token) {
                message.success('Đang chuẩn bị in mã QR đăng nhập cho cổ đông: ' + investorCode);
                console.log('QR Token:', (response as any).token);
            } else {
                message.error('Không thể tạo mã QR');
            }
        } catch (error) {
            console.error('Error generating QR:', error);
            message.error('Lỗi khi tạo mã QR đăng nhập');
        }
    };

    const handleSearchShareholder = async (keywordOverride?: string) => {
        const keyword = keywordOverride || form.getFieldValue('keyword');
        if (!keyword) {
            message.warning('Vui lòng nhập Mã CĐ hoặc CMND/CCCD');
            return;
        }
        setLoading(true);
        try {
            const response: any = await ShareholderManage.searchUsers(keyword).catch(() => null);
            const data = response?.data || response;
            const results = Array.isArray(data) ? data : (data ? [data] : []);



            const shareholder = results.find((s: Shareholder) => s && s.sharesOwned > 0);

            if (shareholder && (shareholder.fullName || shareholder.id)) {
                fillShareholderData(shareholder);
                message.success('Đã tìm thấy thông tin cổ đông');
            } else {
                message.error('Không tìm thấy cổ đông hoặc người này không sở hữu cổ phần');
            }
        } catch (error) {
            console.error('Error searching shareholder:', error);
            message.error('Lỗi khi tìm kiếm cổ đông');
        } finally {
            setLoading(false);
        }
    };

    const fillShareholderData = (shareholder: Shareholder, existingProxy?: ProxyItem) => {
        const displayInvestorCode = shareholder.investorCode || shareholder.id;
        form.setFieldsValue({
            id: shareholder.id,
            keyword: shareholder.cccd || displayInvestorCode,
            investorCode: displayInvestorCode,
            cccd: shareholder.cccd,
            fullName: shareholder.fullName,
            dateOfIssue: shareholder.dateOfIssue ? dayjs(shareholder.dateOfIssue) : null,
            placeOfIssue: (shareholder as any).placeOfIssue || shareholder.address,
            sharesOwned: shareholder.sharesOwned || (shareholder as any).totalOwned,
            attendingShares: (shareholder as any).attendingShares || shareholder.sharesOwned || (shareholder as any).totalOwned,
        });

        if (existingProxy) {
            setSelectedProxyId(existingProxy.id);
            setProxyUserId(existingProxy.proxyId);
            setIsProxy(true);
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
                setIsProxy(true);
                form.setFieldsValue({
                    isProxy: true,
                    proxyId: foundProxy.proxyId,
                    proxyUserId: foundProxy.proxyId,
                    proxyFullName: foundProxy.proxyName,
                    proxyShares: foundProxy.sharesDelegated
                });
            } else {
                setIsProxy(false);
                setProxyUserId(null);
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
    }

    const handleQuickSearch = (keyword: string) => {
        if (mainSearchTimeout) {
            clearTimeout(mainSearchTimeout);
        }

        if (!keyword || keyword.trim().length < 1) {
            setSearchOptions([]);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response: any = await ShareholderManage.searchUsers(keyword).catch(() => null);
                const data = response?.data || response;
                const results = Array.isArray(data) ? data : (data ? [data] : []);

                const filteredResults = results.filter((sh: Shareholder) =>
                    sh.sharesOwned > 0 && (
                        sh.cccd?.toLowerCase().startsWith(keyword.toLowerCase()) ||
                        sh.id?.toLowerCase().startsWith(keyword.toLowerCase())
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
                console.error('Quick search error:', error);
            }
        }, 300);

        setMainSearchTimeout(timeout);
    };

    const handleProxyQuickSearch = (keyword: string) => {
        if (proxySearchTimeout) {
            clearTimeout(proxySearchTimeout);
        }

        if (!keyword || keyword.trim().length < 1) {
            setProxySearchOptions([]);
            return;
        }

        const timeout = setTimeout(async () => {
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
                console.error('Proxy quick search error:', error);
            }
        }, 300);

        setProxySearchTimeout(timeout);
    };

    const onSelectShareholder = (value: string, option: any) => {
        if (option.data) {
            fillShareholderData(option.data);
            setSearchOptions([]);
            message.success('Đã chọn cổ đông: ' + option.data.fullName);
        }
    };

    const onSelectProxy = (value: string, option: any) => {
        if (option.data) {
            const sh = option.data;
            setProxyUserId(sh.id);
            form.setFieldsValue({
                proxyId: sh.id,
                proxyUserId: sh.id,
                proxyFullName: sh.fullName,
                proxyDateOfIssue: sh.dateOfIssue ? dayjs(sh.dateOfIssue) : null,
                proxyPlaceOfIssue: sh.address,
            });
            setProxySearchOptions([]);
            message.success('Đã chọn người nhận ủy quyền: ' + sh.fullName);
        }
    };

    const handleEditProxy = async (proxy: ProxyItem) => {
        if (!proxy.delegatorId) {
            message.warning('Không tìm thấy thông tin định danh người ủy quyền');
            return;
        }

        setLoading(true);
        try {
            // Fetch newest info from server for both delegator and proxy recipient
            const [delegatorRes, proxyRes] = await Promise.all([
                ShareholderManage.getShareholderByCode(proxy.delegatorId).catch(() => null),
                ShareholderManage.getShareholderByCode(proxy.proxyId).catch(() => null)
            ]);

            const delegatorData = (delegatorRes as any)?.data || delegatorRes;
            const proxyData = (proxyRes as any)?.data || proxyRes;

            let shareholder: Shareholder | null = null;
            if (delegatorData && (delegatorData.id || delegatorData.fullName)) {
                shareholder = delegatorData;
            } else {
                // Last resort fallback to search
                const searchRes: any = await ShareholderManage.searchUsers(proxy.delegatorId).catch(() => null);
                const data = searchRes?.data || searchRes;
                const results = Array.isArray(data) ? data : (data ? [data] : []);
                shareholder = results.find((s: Shareholder) =>
                    String(s.id) === String(proxy.delegatorId) ||
                    String(s.investorCode) === String(proxy.delegatorId) ||
                    String(s.cccd) === String(proxy.delegatorId)
                );
            }

            if (shareholder) {
                // If we found fresh info for the proxy recipient, update the proxy object with their latest name
                const updatedProxy = {
                    ...proxy,
                    proxyName: (proxyData && proxyData.fullName) ? proxyData.fullName : proxy.proxyName
                };

                fillShareholderData(shareholder, updatedProxy);
                message.info('Đang chỉnh sửa thông tin ủy quyền (Đã cập nhật từ cơ sở dữ liệu)');
            } else {
                message.warning('Không tìm thấy thông tin cổ đông gốc');
            }
        } catch (error) {
            console.error('Error fetching info:', error);
            message.error('Lỗi khi tải thông tin gốc');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Title level={3} className={styles.title}>Kiểm tra tư cách cổ đông</Title>

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
                                    onChange={setSelectedMeetingId}
                                    className={styles.meetingSelect}
                                    options={meetings.map(m => ({ label: m.title, value: m.id }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '30px' }}>
                            <div className={styles.headerStats}>
                                <span className={styles.headerStatLabel}>Tỷ lệ tham dự:</span>
                                <span className={styles.headerStatValue}>{participationPercent}%</span>
                                {summary?.meetingStats?.participationPercent >= (summary?.meetingStats?.requiredPercent || 0) && (
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
                            <span className={styles.statLabel}>Tổng số cổ phiếu</span>
                            <span className={styles.statValue}>
                                {totalShares.toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Tham dự</span>
                            <span className={`${styles.statValue} ${styles.statValueGreen}`}>
                                {directAttendees.toLocaleString()}
                            </span>
                        </div>
                        <div className={styles.statCard}>
                            <span className={styles.statLabel}>Số cổ đông</span>
                            <span className={`${styles.statValue} ${styles.statValueGreen}`}>
                                {verifiedAttendees.toLocaleString()}
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

            <Row gutter={24}>
                <Col span={24}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Thông tin cổ đông</h2>
                            <Button
                                icon={<PrinterOutlined />}
                                onClick={handlePrintQR}
                                style={{ marginLeft: 'auto' }}
                            >
                                In mã QR đăng nhập
                            </Button>
                        </div>
                        <Form form={form} layout="vertical">
                            <Form.Item name="id" noStyle>
                                <Input type="hidden" />
                            </Form.Item>
                            <Form.Item name="proxyUserId" noStyle>
                                <Input type="hidden" />
                            </Form.Item>
                            <div className={styles.formGrid}>
                                <Form.Item label="Tra cứu (Mã CĐ/CCCD)" name="keyword">
                                    <div className={styles.idInput}>
                                        <AutoComplete
                                            options={searchOptions}
                                            onSearch={handleQuickSearch}
                                            onSelect={onSelectShareholder}
                                            style={{ width: '100%' }}
                                            filterOption={false}
                                        >
                                            <Input
                                                placeholder="Nhập mã hoặc CCCD..."
                                                onPressEnter={() => handleSearchShareholder()}
                                            />
                                        </AutoComplete>
                                        <Button
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            onClick={() => handleSearchShareholder()}
                                            loading={loading}
                                        />
                                        <Button
                                            icon={<QrcodeOutlined />}
                                            onClick={handleQRScan}
                                            title="Quét QR Code"
                                        />
                                    </div>
                                </Form.Item>
                                <Form.Item label="Mã cổ đông" name="investorCode">
                                    <Input readOnly />
                                </Form.Item>
                                <Form.Item label="Số CMND/CCCD" name="cccd">
                                    <Input readOnly />
                                </Form.Item>
                                <Form.Item label="Họ tên" name="fullName">
                                    <Input readOnly />
                                </Form.Item>
                                <Form.Item label="Ngày cấp" name="dateOfIssue">
                                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" disabled />
                                </Form.Item>
                                <Form.Item label="Nơi cấp/Địa chỉ" name="placeOfIssue">
                                    <Input readOnly />
                                </Form.Item>
                                <Form.Item label="Số lượng CP" name="sharesOwned">
                                    <Input readOnly suffix="(cp)" />
                                </Form.Item>
                                <Form.Item
                                    label="Số lượng tham dự"
                                    name="attendingShares"
                                    help={remainingToAllocate < 0 ? <span style={{ color: 'red' }}>Vượt quá số lượng sở hữu</span> : `Còn lại: ${displayRemaining.toLocaleString()} cp`}
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        suffix="(cp)"
                                        placeholder="Nhập số lượng CP tham dự"
                                        onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') e.preventDefault();
                                        }}
                                    />
                                </Form.Item>
                            </div>
                            <div className={styles.actionRow}>
                                <Button
                                    type="primary"
                                    className={styles.confirmButton}
                                    onClick={handleConfirmAttendance}
                                >
                                    Xác nhận số lượng tham dự
                                </Button>
                            </div>

                            <Divider />

                            <Space size="large" align="center" style={{ marginBottom: 16 }}>
                                <Form.Item name="isProxy" valuePropName="checked" noStyle>
                                    <Checkbox onChange={(e) => setIsProxy(e.target.checked)}>Ủy quyền biểu quyết</Checkbox>
                                </Form.Item>
                                {isProxy && (
                                    <Space>
                                        <Text strong>Số lượng:</Text>
                                        <Form.Item name="proxyShares" noStyle>
                                            <Input
                                                type="number"
                                                min={0}
                                                suffix="(cp)"
                                                placeholder="Bỏ trống = Toàn bộ"
                                                style={{ width: '180px' }}
                                                onKeyDown={(e) => {
                                                    if (e.key === '-' || e.key === 'e') e.preventDefault();
                                                }}
                                            />
                                        </Form.Item>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {remainingToAllocate > 0 ? `(Cổ phần còn lại: ${displayRemaining.toLocaleString()} cp)` : "(Đã hết cổ phần)"}
                                        </Text>
                                    </Space>
                                )}
                            </Space>

                            {isProxy && (
                                <div className={styles.proxyBox}>
                                    <Text strong style={{ color: '#d32f2f', display: 'block', marginBottom: 12 }}>THÔNG TIN NGƯỜI ĐƯỢC ỦY QUYỀN</Text>
                                    <div className={styles.formGrid}>
                                        <Form.Item label="Mã/CCCD người được UQ" name="proxyId">
                                            <AutoComplete
                                                options={proxySearchOptions}
                                                onSearch={handleProxyQuickSearch}
                                                onSelect={onSelectProxy}
                                                style={{ width: '100%' }}
                                                filterOption={false}
                                            >
                                                <Input placeholder="Nhập mã hoặc CCCD người nhận UQ" />
                                            </AutoComplete>
                                        </Form.Item>
                                        <Form.Item label="Họ tên người nhận UQ" name="proxyFullName">
                                            <Input />
                                        </Form.Item>
                                        <Form.Item label="Ngày cấp" name="proxyDateOfIssue">
                                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                                        </Form.Item>
                                        <Form.Item label="Nơi cấp" name="proxyPlaceOfIssue">
                                            <Input />
                                        </Form.Item>
                                    </div>
                                    <div className={styles.actionRow}>
                                        <Button
                                            type="primary"
                                            icon={<SaveOutlined />}
                                            className={styles.confirmButton}
                                            onClick={handleSaveProxy}
                                        >
                                            Lưu thông tin Ủy quyền (Ctr+S)
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={24}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Dữ liệu tham dự & ủy quyền hiện tại</h2>
                        </div>
                        <div className={styles.tableSection}>
                            <Title level={5}>Danh sách cổ đông đã xác nhận</Title>
                            <Table
                                columns={shareholderColumns}
                                dataSource={shareholdersList}
                                size="small"
                                pagination={{ pageSize: 5 }}
                                rowKey="investorCode"
                                onRow={(record) => ({
                                    onClick: async () => {
                                        setLoading(true);
                                        try {
                                            // Always fetch 'original' info from server even when clicking local list
                                            const code = record.investorCode || (record as any).id;
                                            const response: any = await ShareholderManage.getShareholderByCode(code).catch(() => null);
                                            const data = response?.data || response;

                                            if (data && (data.fullName || data.id)) {
                                                // Keep the attendingShares from the record if it exists
                                                const mergedData = {
                                                    ...data,
                                                    attendingShares: (record as any).attendingShares
                                                };
                                                fillShareholderData(mergedData);
                                            } else {
                                                fillShareholderData(record as any);
                                            }
                                            message.info(`Đang sửa thông tin cổ đông: ${record.fullName}`);
                                        } catch (e) {
                                            fillShareholderData(record as any);
                                        } finally {
                                            setLoading(false);
                                        }
                                    },
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </div>
                        <div className={styles.tableSection}>
                            <Title level={5}>Danh sách lượt ủy quyền</Title>
                            <Table
                                columns={proxyColumns}
                                dataSource={proxyList}
                                size="small"
                                pagination={{ pageSize: 5 }}
                                rowKey="id"
                                onRow={(record) => ({
                                    onClick: () => handleEditProxy(record),
                                    style: { cursor: 'pointer' }
                                })}
                            />
                        </div>

                        <div className={styles.footerContainer}>
                            <div className={styles.buttonGrid2x2}>
                                <Button className={styles.listButton}>Danh sách tham dự trực tiếp (F11)</Button>
                                <Button className={styles.listButton}>Danh sách cổ đông tham dự (F12)</Button>
                                <Button className={styles.listButton}>Danh sách người được UQ</Button>
                                <Button className={styles.listButton}>Danh sách cổ đông gửi UQ</Button>
                            </div>
                            <div className={styles.deleteButtonRow}>
                                <Button
                                    danger
                                    style={{ width: 'auto', minWidth: '120px' }}
                                    icon={<DeleteOutlined />}
                                    onClick={handleDeleteProxy}
                                    loading={loading}
                                >
                                    Xóa UQ
                                </Button>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
}
