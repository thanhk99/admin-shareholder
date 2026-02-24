'use client';

import '@ant-design/v5-patch-for-react-19';

import { useState, useEffect } from 'react';
import { Form, Row, Col, Typography, message } from 'antd';
import dayjs from 'dayjs';
import styles from './EligibilityCheck.module.css';

import { ProxyItem, ProxyRequest } from '@/app/types/proxy';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import ProxyService from '@/lib/api/proxy';
import { DashboardService } from '@/lib/api/dashboard';
import { AttendanceService } from '@/lib/api/attendance';

import MeetingStats from './MeetingStats';
import ShareholderSearchForm from './ShareholderSearchForm';
import ProxyForm from './ProxyForm';
import AttendanceTable from './AttendanceTable';
import ProxyTable from './ProxyTable';
import { useEligibilityData } from './useEligibilityData';

const { Title } = Typography;

export default function EligibilityCheck() {
    const [form] = Form.useForm();
    const [isProxy, setIsProxy] = useState(false);

    const {
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
        handleProxyQuickSearch
    } = useEligibilityData(form);

    const attendingSharesWatch = Form.useWatch('attendingShares', form);
    const sharesOwnedWatch = Form.useWatch('sharesOwned', form);
    const investorCodeWatch = Form.useWatch('investorCode', form);
    const delegatorIdWatch = Form.useWatch('id', form);

    const alreadyDelegatedCount = proxyList
        .filter((p: ProxyItem) => {
            if (selectedProxyId && p.id === selectedProxyId) {
                return false;
            }
            return String(p.delegatorId) === String(investorCodeWatch) || String(p.delegatorId) === String(delegatorIdWatch);
        })
        .reduce((sum: number, p: ProxyItem) => sum + (Number(p.sharesDelegated) || 0), 0);

    const remainingToAllocate = (Number(sharesOwnedWatch) || 0) - (Number(attendingSharesWatch) || 0) - alreadyDelegatedCount;
    const displayRemaining = Math.max(0, remainingToAllocate);

    const totalShareholders = summary?.userStats?.totalShareholders || 0;
    const totalShares = summary?.userStats?.totalSharesRepresented || 0;

    const directAttendeeIds = new Set(shareholdersList.map((s: any) => s.investorCode || s.id).filter(Boolean));
    const proxyRecipientIds = new Set(proxyList.map((p: ProxyItem) => p.proxyId).filter(Boolean));
    const allAttendeeIds = new Set([...directAttendeeIds, ...proxyRecipientIds]);
    const totalAttendees = allAttendeeIds.size;

    const shareholderIds = new Set(shareholdersList.map((s: any) => s.investorCode || s.id).filter(Boolean));
    const proxyRecipientsWhoAreShareholders = proxyList.filter((p: ProxyItem) => shareholderIds.has(p.proxyId)).map((p: ProxyItem) => p.proxyId);
    const uniqueShareholderAttendees = new Set([...shareholderIds, ...proxyRecipientsWhoAreShareholders]);
    const totalShareholderCount = uniqueShareholderAttendees.size;

    const totalLocalDirectShares = shareholdersList.reduce((sum: number, sh: any) => sum + (Number(sh.attendingShares) || 0), 0);
    const totalLocalProxyShares = proxyList.reduce((sum: number, p: ProxyItem) => sum + (Number(p.sharesDelegated) || 0), 0);
    const totalAttendingShares = totalLocalDirectShares + totalLocalProxyShares;

    const participationPercent = totalShares > 0 ? ((totalAttendingShares / totalShares) * 100).toFixed(2) : '0.00';

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
            const response: any = await AttendanceService.registerAttendance({
                meetingId: selectedMeetingId,
                investorCode: values.investorCode,
                attendingShares: attendingShares,
                participationType: 'DIRECT'
            });

            const newEntry = {
                shareholderCode: response.shareholderCode || response.userId || response.investorCode,
                investorCode: response.investorCode,
                cccd: response.cccd,
                fullName: response.fullName,
                sharesOwned: response.sharesOwned,
                attendingShares: response.attendingShares,
                delegatedShares: response.delegatedShares,
                receivedProxyShares: response.receivedProxyShares,
                totalShares: response.totalShares,
                id: response.userId
            };

            setShareholdersList((prev: any) => {
                const index = prev.findIndex((s: any) => s.investorCode === response.investorCode);
                if (index > -1) {
                    const newList = [...prev];
                    newList[index] = newEntry as any;
                    return newList;
                }
                return [newEntry as any, ...prev];
            });

            const [responseAttended, summaryRes] = await Promise.all([
                AttendanceService.getAttendedParticipants(selectedMeetingId).catch(() => []),
                DashboardService.getSummary().catch(() => null)
            ]);

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

            if (summaryRes) {
                setSummary(summaryRes);
            }

            message.success('Xác nhận số lượng tham dự thành công');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
            message.error(`Lỗi khi xác nhận tham dự: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProxy = async () => {
        const values = form.getFieldsValue();
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

        const existingPairProxy = proxyList.find((p: ProxyItem) =>
            String(p.delegatorId) === String(delegatorDbId) &&
            String(p.proxyId) === String(effectiveProxyId) &&
            p.status === 'ACTIVE'
        );

        const proxyToRevokeId = selectedProxyId || existingPairProxy?.id;

        const totalDelegated = proxyList
            .filter((p: ProxyItem) => String(p.delegatorId) === String(values.investorCode) || String(p.delegatorId) === String(values.id))
            .reduce((sum: number, p: ProxyItem) => sum + (Number(p.sharesDelegated) || 0), 0);

        const proxyToReplace = proxyList.find((p: ProxyItem) => p.id === proxyToRevokeId);
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
            if (proxyToRevokeId) {
                try {
                    await ProxyService.revokeProxy(selectedMeetingId, proxyToRevokeId);
                } catch (revokeError) {
                    // Ignore revoke errors
                }
            }

            const proxyRequest: ProxyRequest = {
                delegatorId: delegatorDbId,
                proxyId: effectiveProxyId,
                sharesDelegated: delegateAmount
            };

            const createdProxy = await ProxyService.createProxy(selectedMeetingId, proxyRequest);

            message.success(proxyToRevokeId ? `Đã cập nhật (ghi đè) thông tin ủy quyền thành công` : `Lưu thông tin ủy quyền thành công`);

            const newProxy: ProxyItem = {
                ...createdProxy,
                proxyName: values.proxyFullName,
                delegatorName: values.fullName,
                delegatorId: delegatorDbId
            } as ProxyItem;

            setProxyList((prev: ProxyItem[]) => {
                let newList = prev.filter((p: ProxyItem) => p.id !== proxyToRevokeId);
                return [newProxy, ...newList];
            });

            const responseAttended = await AttendanceService.getAttendedParticipants(selectedMeetingId).catch(() => []);
            const attended = (responseAttended as any)?.data || responseAttended;
            if (Array.isArray(attended)) {
                const mappedShareholders = attended.map((a: any) => ({
                    shareholderCode: a.shareholderCode || a.userId || a.investorCode,
                    investorCode: a.investorCode,
                    cccd: a.cccd,
                    fullName: a.fullName,
                    sharesOwned: a.sharesOwned,
                    attendingShares: a.attendingShares,
                    delegatedShares: a.delegatedShares,
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

            setProxyList((prev: ProxyItem[]) => prev.filter((p: ProxyItem) => p.id !== selectedProxyId));

            const responseAttended = await AttendanceService.getAttendedParticipants(selectedMeetingId).catch(() => []);
            const attended = (responseAttended as any)?.data || responseAttended;
            if (Array.isArray(attended)) {
                const mappedShareholders = attended.map((a: any) => ({
                    shareholderCode: a.shareholderCode || a.userId || a.investorCode,
                    investorCode: a.investorCode,
                    cccd: a.cccd,
                    fullName: a.fullName,
                    sharesOwned: a.sharesOwned,
                    attendingShares: a.attendingShares,
                    delegatedShares: a.delegatedShares,
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
    }, []);

    const handleQRScan = () => {
        message.info('Tính năng quét QR đang được khởi tạo. Vui lòng kết nối camera.');
    };

    const handlePrintQR = async () => {
        const investorCode = form.getFieldValue('investorCode');
        const userId = form.getFieldValue('id');

        if (!investorCode) {
            message.warning('Vui lòng tìm kiếm cổ đông trước khi in mã QR');
            return;
        }

        try {
            const response = await ShareholderManage.generateQrLogin(userId || investorCode);

            if (response && (response as any).token) {
                message.success('Đang chuẩn bị in mã QR đăng nhập cho cổ đông: ' + investorCode);
            } else {
                message.error('Không thể tạo mã QR');
            }
        } catch (error) {
            message.error('Lỗi khi tạo mã QR đăng nhập');
        }
    };

    const handleSearchShareholder = async () => {
        const keyword = form.getFieldValue('keyword');
        if (!keyword) {
            message.warning('Vui lòng nhập Mã CĐ hoặc CMND/CCCD');
            return;
        }
        setLoading(true);
        try {
            const response: any = await ShareholderManage.searchUsers(keyword).catch(() => null);
            const data = response?.data || response;
            const results = Array.isArray(data) ? data : (data ? [data] : []);

            const shareholder = results.find((s: any) => s && s.sharesOwned > 0);

            if (shareholder && (shareholder.fullName || shareholder.id)) {
                fillShareholderData(shareholder);
                message.success('Đã tìm thấy thông tin cổ đông');
            } else {
                message.error('Không tìm thấy cổ đông hoặc người này không sở hữu cổ phần');
            }
        } catch (error) {
            message.error('Lỗi khi tìm kiếm cổ đông');
        } finally {
            setLoading(false);
        }
    };

    const onSelectShareholder = (_value: string, option: any) => {
        if (option.data) {
            fillShareholderData(option.data);
            setSearchOptions([]);
            message.success('Đã chọn cổ đông: ' + option.data.fullName);
        }
    };

    const onSelectProxy = (_value: string, option: any) => {
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
            const [delegatorRes, proxyRes] = await Promise.all([
                ShareholderManage.getShareholderByCode(proxy.delegatorId).catch(() => null),
                ShareholderManage.getShareholderByCode(proxy.proxyId).catch(() => null)
            ]);

            const delegatorData = (delegatorRes as any)?.data || delegatorRes;
            const proxyData = (proxyRes as any)?.data || proxyRes;

            let shareholder: any = null;
            if (delegatorData && (delegatorData.id || delegatorData.fullName)) {
                shareholder = delegatorData;
            } else {
                const searchRes: any = await ShareholderManage.searchUsers(proxy.delegatorId).catch(() => null);
                const data = searchRes?.data || searchRes;
                const results = Array.isArray(data) ? data : (data ? [data] : []);
                shareholder = results.find((s: any) =>
                    String(s.id) === String(proxy.delegatorId) ||
                    String(s.investorCode) === String(proxy.delegatorId) ||
                    String(s.cccd) === String(proxy.delegatorId)
                );
            }

            if (shareholder) {
                const updatedProxy = {
                    ...proxy,
                    proxyName: (proxyData && proxyData.fullName) ? proxyData.fullName : proxy.proxyName
                };

                fillShareholderData(shareholder, updatedProxy);
                message.info('Đang chỉnh sửa thông tin ủy quyền');
            } else {
                message.warning('Không tìm thấy thông tin cổ đông gốc');
            }
        } catch (error) {
            message.error('Lỗi khi tải thông tin gốc');
        } finally {
            setLoading(false);
        }
    };

    const handleAttendanceRowClick = async (record: any) => {
        setLoading(true);
        try {
            const code = record.shareholderCode || record.investorCode || record.id;
            const response: any = await ShareholderManage.getShareholderByCode(code).catch(() => null);
            const data = response?.data || response;

            if (data && (data.fullName || data.id)) {
                const mergedData = {
                    ...data,
                    attendingShares: record.attendingShares
                };
                fillShareholderData(mergedData);
            } else {
                fillShareholderData(record);
            }
            message.info(`Đang sửa thông tin cổ đông: ${record.fullName}`);
        } catch (e) {
            fillShareholderData(record);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Title level={3} className={styles.title}>Kiểm tra tư cách cổ đông</Title>

            <MeetingStats
                meetings={meetings}
                selectedMeetingId={selectedMeetingId}
                onMeetingChange={setSelectedMeetingId}
                totalShareholders={totalShareholders}
                totalShares={totalShares}
                totalAttendees={totalAttendees}
                totalShareholderCount={totalShareholderCount}
                totalAttendingShares={totalAttendingShares}
                participationPercent={participationPercent}
            />

            <Row gutter={24}>
                <Col span={24}>
                    <ShareholderSearchForm
                        form={form}
                        loading={loading}
                        searchOptions={searchOptions}
                        remainingToAllocate={remainingToAllocate}
                        displayRemaining={displayRemaining}
                        onQuickSearch={handleQuickSearch}
                        onSelectShareholder={onSelectShareholder}
                        onSearch={handleSearchShareholder}
                        onQRScan={handleQRScan}
                        onPrintQR={handlePrintQR}
                        onConfirmAttendance={handleConfirmAttendance}
                    />

                    <ProxyForm
                        form={form}
                        isProxy={isProxy}
                        proxySearchOptions={proxySearchOptions}
                        remainingToAllocate={remainingToAllocate}
                        displayRemaining={displayRemaining}
                        onProxyChange={setIsProxy}
                        onProxyQuickSearch={handleProxyQuickSearch}
                        onSelectProxy={onSelectProxy}
                        onSaveProxy={handleSaveProxy}
                    />
                </Col>
            </Row>

            <Row gutter={24}>
                <Col span={24}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Dữ liệu tham dự & ủy quyền hiện tại</h2>
                        </div>
                        <AttendanceTable
                            shareholdersList={shareholdersList}
                            onRowClick={handleAttendanceRowClick}
                        />
                        <ProxyTable
                            proxyList={proxyList}
                            loading={loading}
                            onEditProxy={handleEditProxy}
                            onDeleteProxy={handleDeleteProxy}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
}
