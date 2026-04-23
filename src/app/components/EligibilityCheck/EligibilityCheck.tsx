'use client';
import React, { useState, useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';

import {
    IdcardOutlined,
    BarcodeOutlined,
    CalendarOutlined,
    BankOutlined,
    PhoneOutlined,
    MailOutlined,
    SyncOutlined,
    CheckOutlined,
    DownOutlined,
    UpOutlined,
    UserAddOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import { Form, Row, Col, Typography, message, Input, Button, Table, Tag, Collapse, Checkbox, QRCode } from 'antd';
import styles from './EligibilityCheck.module.css';

import MeetingStats from './MeetingStats';
import ShareholderSearchForm from './ShareholderSearchForm';
import { useEligibilityData } from './useEligibilityData';
import { AttendanceService } from '@/lib/api/attendance';
import { DashboardService } from '@/lib/api/dashboard';
import ProxyService from '@/lib/api/proxy';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import { printVotingCard } from './printVotingCard';
import AddProxyModal from './AddProxyModal';

const { Text } = Typography;

export default function EligibilityCheck() {
    const [form] = Form.useForm();
    const [isProxyMode, setIsProxyMode] = useState(false);
    const addProxyRef = React.useRef<any>(null);

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
        searchOptions,
        fillShareholderData,
        handleQuickSearch,
        loadMeetingData,
        currentBundle,
        handleBundleSearch,
        isScanningRef,
        lastCleanCccdRef
    } = useEligibilityData(form);

    // Focus Trap Logic: Loop Tab between index 1 and 8
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Tab') {
                const activeElement = document.activeElement as HTMLElement;
                const tabIndex = activeElement?.tabIndex;

                if (e.shiftKey) {
                    // Shift + Tab: Nếu đang ở trường 1, nhảy về trường 8
                    if (tabIndex === 1) {
                        e.preventDefault();
                        const lastEl = document.querySelector('[tabindex="8"]') as HTMLElement;
                        lastEl?.focus();
                    }
                } else {
                    // Tab: Nếu đang ở trường 8, nhảy về trường 1
                    if (tabIndex === 8) {
                        e.preventDefault();
                        const firstEl = document.querySelector('[tabindex="1"]') as HTMLElement;
                        firstEl?.focus();
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const totalShareholders = summary?.userStats?.totalShareholders || 0;
    const totalShares = summary?.userStats?.totalSharesRepresented || 0;
    const attendedCount = summary?.userStats?.attendedCount || 0;
    const attendedShares = summary?.userStats?.attendedShares || 0;
    const participationRate = summary?.userStats?.participationRate || 0;

    const investorCodeWatch = Form.useWatch('investorCode', form);
    const sharesOwnedWatch = Form.useWatch('sharesOwned', form) || 0;
    const delegatedSharesWatch = Form.useWatch('delegatedShares', form) || 0;
    const receivedProxySharesWatch = Form.useWatch('receivedProxyShares', form) || 0;
    const attendingSharesWatch = Form.useWatch('attendingShares', form) || 0;

    // Tính số cổ phần tối đa có thể tham dự dựa trên công thức
    const maxAttendingShares = Number(sharesOwnedWatch) - Number(delegatedSharesWatch);

    // Tính số cổ phần còn lại có thể xác nhận tham dự
    const remainingToAllocate = maxAttendingShares - Number(attendingSharesWatch);
    const displayRemaining = Math.max(0, remainingToAllocate);

    const isParticipated = !!currentBundle?.shareholder?.checkedInAt;

    // Công thức uỷ quyền:
    // Nếu chưa tham dự: uỷ quyền tối đa (số cổ phần có thể tham dự)
    // Nếu đã tham dự: Cổ sở hữu - Cổ tham gia - Cổ đã uỷ quyền trước đó
    const remainingToProxy = isParticipated
        ? Math.max(0, Number(sharesOwnedWatch) - Number(attendingSharesWatch) - Number(delegatedSharesWatch))
        : maxAttendingShares;

    const handleConfirmAttendance = async () => {
        if (!selectedMeetingId) {
            message.warning('Vui lòng chọn đại hội');
            return;
        }

        const values = form.getFieldsValue();
        if (!values.investorCode) {
            message.warning('Vui lòng chọn cổ đông');
            return;
        }

        const entering = Number(values.attendingShares) || 0;
        const owned = Number(values.sharesOwned) || 0;
        const delegated = Number(values.delegatedShares) || 0;
        const maxAllowed = owned - delegated;

        if (entering <= 0) {
            message.error('Số lượng cổ phần tham dự phải lớn hơn 0');
            return;
        }

        if (entering > maxAllowed) {
            message.error(`Số lượng tham dự (${entering.toLocaleString()} cp) vượt quá số cổ phần có thể tham dự (${maxAllowed.toLocaleString()} cp)`);
            return;
        }

        // Cổ đông sở hữu CP > 0 thì là DIRECT, ngược lại (chỉ nhận ủy quyền) là PROXY
        const participationType = owned > 0 ? 'DIRECT' : 'PROXY';

        setLoading(true);
        try {
            await AttendanceService.registerAttendance({
                meetingId: selectedMeetingId,
                cccd: values.cccd,
                attendingShares: values.attendingShares,
                participationType: participationType
            });

            const isUpdate = !!currentBundle?.shareholder?.checkedInAt;
            message.success(isUpdate ? 'Cập nhật thành công' : 'Xác nhận tham dự thành công');

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
                    participationType: a.participationType,
                    attendingShares: a.attendingShares,
                    sharesOwned: a.sharesOwned || 0,
                    delegatedShares: a.delegatedShares || 0,
                    receivedProxyShares: a.receivedProxyShares || 0,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }
            if (summaryRes) setSummary(summaryRes);

            form.resetFields();
        } catch (error: any) {
            message.error(`Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAttendance = async () => {
        if (!selectedMeetingId) {
            message.warning('Vui lòng chọn đại hội');
            return;
        }

        const cccd = form.getFieldValue('cccd');
        if (!cccd) {
            message.warning('Vui lòng chọn cổ đông');
            return;
        }

        setLoading(true);
        try {
            await AttendanceService.cancelAttendance(selectedMeetingId, cccd);
            message.success('Hủy tham dự thành công');

            // Refresh data
            const keyword = form.getFieldValue('keyword');
            if (keyword) {
                await handleBundleSearch(keyword);
            }

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
                    participationType: a.participationType,
                    attendingShares: a.attendingShares,
                    sharesOwned: a.sharesOwned || 0,
                    delegatedShares: a.delegatedShares || 0,
                    receivedProxyShares: a.receivedProxyShares || 0,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }
            if (summaryRes) setSummary(summaryRes);

        } catch (error: any) {
            message.error(`Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const [isAddProxyModalOpen, setIsAddProxyModalOpen] = useState(false);

    const handleConfirmProxyAttendance = async (proxyAttendee: any, newDelegatedShares: number) => {
        const proxyCccd = proxyAttendee.proxyParticipant.cccd;

        if (!selectedMeetingId || !proxyCccd || !proxyAttendee.delegationId) {
            message.warning('Dữ liệu không hợp lệ');
            return;
        }

        if (newDelegatedShares <= 0) {
            message.error('Số lượng uỷ quyền phải lớn hơn 0');
            return;
        }

        setLoading(true);
        try {
            // Bước 1: Cập nhật số cổ phần uỷ quyền
            await ProxyService.updateProxyShares(
                selectedMeetingId,
                proxyAttendee.delegationId,
                newDelegatedShares
            );

            // Bước 2: Xác nhận tham dự cho người đại diện (điểm danh)
            const isAlreadyCheckedIn = proxyAttendee.proxyParticipant?.checkedInAt != null;
            if (!isAlreadyCheckedIn) {
                await AttendanceService.registerAttendance({
                    meetingId: selectedMeetingId,
                    cccd: proxyCccd,
                    attendingShares: newDelegatedShares,
                    participationType: 'PROXY'
                });
            }

            message.success(`${isAlreadyCheckedIn ? 'Cập nhật' : 'Xác nhận tham dự'} cho ${proxyAttendee.proxyParticipant.fullName} thành công`);

            const keyword = form.getFieldValue('keyword');
            if (keyword) {
                await handleBundleSearch(keyword);
            }

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
                    participationType: a.participationType,
                    attendingShares: a.attendingShares,
                    sharesOwned: a.sharesOwned || 0,
                    delegatedShares: a.delegatedShares || 0,
                    receivedProxyShares: a.receivedProxyShares || 0,
                    id: a.userId
                }));
                setShareholdersList(mappedShareholders as any[]);
            }
            if (summaryRes) setSummary(summaryRes);

        } catch (error: any) {
            message.error(`Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handlePrintVotingCard = async () => {
        if (!selectedMeetingId) {
            message.warning('Vui lòng chọn đại hội trước');
            return;
        }

        let targetCccd = "";
        if (isProxyMode) {
            const proxyValues = addProxyRef.current?.getFormValues();
            if (!proxyValues || !proxyValues.cccd) {
                message.warning('Vui lòng nhập CCCD người nhận uỷ quyền');
                return;
            }
            targetCccd = proxyValues.cccd;
        } else {
            if (!currentBundle?.shareholder?.cccd) {
                message.warning('Vui lòng chọn cổ đông');
                return;
            }
            targetCccd = currentBundle.shareholder.cccd;
        }

        setLoading(true);
        try {
            // LUÔN FETCH TỪ BACKEND ĐỂ LẤY QUYỀN BIỂU QUYẾT CHÍNH XÁC (meeting_parti)
            const bundle = await AttendanceService.getCheckInBundle(selectedMeetingId, targetCccd);
            if (!bundle || !bundle.shareholder) {
                throw new Error("Không tìm thấy dữ liệu từ backend cho " + targetCccd + ". Vui lòng đảm bảo đã lưu thông tin uỷ quyền trước khi in.");
            }
            
            const shareholder = bundle.shareholder;
            // Quyền biểu quyết = attendingShares + receivedProxyShares (từ backend)
            const votingRights = (shareholder.attendingShares || 0) + (shareholder.receivedProxyShares || 0);

            // 1. Lấy hoặc tạo Magic Token để đăng nhập nhanh
            let magicLink = "";
            const targetId = shareholder.userId || (shareholder as any).id || (shareholder as any).investorCode;
            
            message.loading({ content: 'Đang chuẩn bị thẻ biểu quyết...', key: 'printing', duration: 0 });

            try {
                if (targetId) {
                    // Bước 1: Thử lấy token đã tồn tại
                    const existingRes = await ShareholderManage.getExistingQrToken(targetId).catch(() => null);
                    const data = (existingRes as any)?.data !== undefined ? (existingRes as any).data : existingRes;
                    
                    if (data && data.qrContent && data.token && !data.qrContent.includes('token=null')) {
                        magicLink = data.qrContent;
                    } 
                    
                    // Bước 2: Nếu chưa có magicLink hoặc link bị lỗi (chứa token=null), bắt buộc gọi API tạo mới
                    if (!magicLink || magicLink.includes('token=null')) {
                        const genRes = await ShareholderManage.generateQrLogin(targetId).catch(() => null);
                        const genData = (genRes as any)?.data !== undefined ? (genRes as any).data : genRes;
                        if (genData && genData.qrContent && genData.token && !genData.qrContent.includes('token=null')) {
                            magicLink = genData.qrContent;
                        }
                    }
                }
            } catch (e) {
                console.warn("Magic QR Error:", e);
            } finally {
                // Đảm bảo luôn có link dự phòng nếu tất cả các bước trên thất bại hoặc vẫn ra link lỗi
                if (!magicLink || magicLink.includes('token=null')) {
                    magicLink = `http://dhcd.vix.local/login?cccd=${shareholder.cccd}`;
                }
                message.destroy('printing');
            }

            // 2. Gọi hàm in từ file tiện ích
            printVotingCard({
                fullName: shareholder.fullName,
                cccd: shareholder.cccd,
                votingRights: votingRights,
                meetingTitle: meetings.find(m => m.id === selectedMeetingId)?.title || "Đại hội cổ đông 2026",
                magicLink
            });

        } catch (error: any) {
            console.error('Print Error:', error);
            message.error('Lỗi khi lấy dữ liệu in: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddProxy = () => {
        if (!selectedMeetingId) {
            message.warning('Vui lòng chọn đại hội');
            return;
        }
        setIsAddProxyModalOpen(true);
    };

    const handleAddProxySuccess = async () => {
        setIsAddProxyModalOpen(false);
        const keyword = form.getFieldValue('keyword');
        if (keyword) {
            await handleBundleSearch(keyword);
        }
    };

    return (
        <div className={styles.container}>
            <MeetingStats
                meetings={meetings}
                selectedMeetingId={selectedMeetingId}
                onMeetingChange={setSelectedMeetingId}
                totalShareholders={totalShareholders}
                totalShares={totalShares}
                totalAttendees={attendedCount}
                totalShareholderCount={summary?.userStats?.totalShareholderCount || 0}
                totalAttendingShares={attendedShares}
                participationPercent={String(participationRate.toFixed ? participationRate.toFixed(2) : participationRate)}
            />
            <Row gutter={24}>
                <Col span={24}>
                    <ShareholderSearchForm
                        form={form}
                        loading={loading}
                        searchOptions={searchOptions}
                        remainingToAllocate={remainingToAllocate}
                        displayRemaining={displayRemaining}
                        isParticipated={isParticipated}
                        checkedInAt={currentBundle?.shareholder?.checkedInAt}
                        remainingToProxy={remainingToProxy}
                        onQuickSearch={handleQuickSearch}
                        onBundleSearch={handleBundleSearch}
                        onConfirmAttendance={handleConfirmAttendance}
                        onCancelAttendance={handleCancelAttendance}
                        onPrintQR={handlePrintVotingCard}
                        isProxyMode={isProxyMode}
                        onSelectShareholder={(userId, option) => {
                            handleBundleSearch(option.data.cccd);
                            setIsProxyMode(false);
                        }}
                        onSearch={() => {
                            const keyword = form.getFieldValue('keyword');
                            if (keyword) handleBundleSearch(keyword);
                        }}
                        isScanningRef={isScanningRef}
                        lastCleanCccdRef={lastCleanCccdRef}
                        rightContent={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '4px 12px',
                                    backgroundColor: isProxyMode ? '#e6f7ff' : '#f5f5f5',
                                    borderRadius: '6px',
                                    border: `1px solid ${isProxyMode ? '#91d5ff' : '#d9d9d9'}`,
                                    width: 'fit-content',
                                    transition: 'all 0.3s'
                                }}>
                                    <Checkbox
                                        checked={isProxyMode}
                                        onChange={e => setIsProxyMode(e.target.checked)}
                                        tabIndex={4}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setIsProxyMode(!isProxyMode);
                                            }
                                        }}
                                    />
                                    <span style={{ fontSize: '13px', fontWeight: 500, color: isProxyMode ? '#1890ff' : '#595959' }}>
                                        <UserAddOutlined style={{ marginRight: 4 }} />
                                        Uỷ quyền người khác
                                    </span>
                                </div>

                                <AddProxyModal
                                    ref={addProxyRef}
                                    open={true}
                                    onCancel={() => setIsProxyMode(false)}
                                    onSuccess={handleAddProxySuccess}
                                    meetingId={selectedMeetingId || ""}
                                    delegatorCccd={form.getFieldValue('cccd') || ''}
                                    delegatorName={form.getFieldValue('fullName') || 'Cổ đông'}
                                    maxShares={remainingToProxy}
                                    renderInline={true}
                                    active={isProxyMode}
                                />
                            </div>
                        }
                    />


                    {/* Bảng Danh sách những người mà cổ đông này uỷ quyền cho (Outgoing) */}
                    {currentBundle && currentBundle.outgoingProxies && currentBundle.outgoingProxies.length > 0 && (
                        <div className={styles.section} style={{ marginTop: 16, border: '1px solid #d9d9d9', backgroundColor: '#fff', borderRadius: 8, padding: 0, overflow: 'hidden' }}>
                            <div
                                style={{
                                    backgroundColor: '#fafafa',
                                    borderBottom: '1px solid #f0f0f0',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'default'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 style={{ color: '#262626', margin: 0, fontSize: 16, fontWeight: 600 }}>Cổ đông này uỷ quyền cho những người sau:</h2>
                                </div>
                                <span style={{ color: '#595959', fontSize: 12 }}>Xác nhận từng đại diện tham dự</span>
                            </div>

                            <div style={{ padding: 12 }}>
                                <Table
                                    dataSource={currentBundle.outgoingProxies}
                                    pagination={false}
                                    size="small"
                                    rowKey={(p: any) => p.delegationId}
                                    columns={[
                                        {
                                            title: 'Người nhận uỷ quyền',
                                            key: 'proxyInfo',
                                            render: (_: any, p: any) => {
                                                const proxy = p.proxyParticipant;
                                                return (
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 14 }}>{proxy.fullName}</div>
                                                        <div style={{ fontSize: 11, color: '#595959', marginTop: 2 }}>
                                                            <span style={{ marginRight: 12 }}><BarcodeOutlined style={{ marginRight: 4 }} />Mã: <b>{proxy.investorCode || 'N/A'}</b></span>
                                                            <span><IdcardOutlined style={{ marginRight: 4 }} />CCCD: <b>{proxy.cccd}</b></span>
                                                        </div>
                                                        {(proxy.dateOfIssue || proxy.placeOfIssue) && (
                                                            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                                                                {proxy.dateOfIssue && <span style={{ marginRight: 12 }}><CalendarOutlined style={{ marginRight: 4 }} />Ngày cấp: {proxy.dateOfIssue}</span>}
                                                                {proxy.placeOfIssue && <span><BankOutlined style={{ marginRight: 4 }} />Nơi cấp: {proxy.placeOfIssue}</span>}
                                                            </div>
                                                        )}
                                                        {(proxy.phoneNumber || proxy.email) && (
                                                            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                                                                {proxy.phoneNumber && <span style={{ marginRight: 12 }}><PhoneOutlined style={{ marginRight: 4 }} />{proxy.phoneNumber}</span>}
                                                                {proxy.email && <span><MailOutlined style={{ marginRight: 4 }} />{proxy.email}</span>}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                        },
                                        {
                                            title: 'SL Uỷ quyền',
                                            key: 'sharesDelegated',
                                            width: 160,
                                            render: (_: any, p: any) => {
                                                const currentVal = p.sharesDelegated || 0;
                                                return (
                                                    <Input
                                                        defaultValue={currentVal}
                                                        suffix="cp"
                                                        size="small"
                                                        type="number"
                                                        min={0}
                                                        tabIndex={-1}
                                                        onChange={(e) => {
                                                            const val = parseInt(e.target.value) || 0;
                                                            (p as any)._tempDelegated = val;
                                                        }}
                                                    />
                                                );
                                            }
                                        },
                                        {
                                            title: 'Thao tác',
                                            key: 'action',
                                            align: 'center',
                                            width: 130,
                                            render: (_: any, p: any) => {
                                                const isProxyCheckedIn = p.proxyParticipant?.checkedInAt != null;
                                                return (
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <Button
                                                            size="small"
                                                            icon={<PrinterOutlined />}
                                                            tabIndex={-1}
                                                            onClick={async () => {
                                                                const proxy = p.proxyParticipant;
                                                                const targetCccd = proxy.cccd;
                                                                setLoading(true);
                                                                try {
                                                                    // FETCH TỪ BACKEND
                                                                    const bundle = await AttendanceService.getCheckInBundle(selectedMeetingId, targetCccd);
                                                                    const sh = bundle.shareholder;
                                                                    const votingRights = (sh.attendingShares || 0) + (sh.receivedProxyShares || 0);
                                                                    const targetUserId = sh.userId;

                                                                    let magicLink = "";
                                                                    const targetId = sh.userId || (sh as any).id || (sh as any).investorCode;
                                                                    
                                                                    message.loading({ content: 'Trích xuất dữ liệu in...', key: 'printing_proxy', duration: 0 });

                                                                    try {
                                                                        if (targetId) {
                                                                            // Thử lấy token đã tồn tại
                                                                            const existingRes = await ShareholderManage.getExistingQrToken(targetId).catch(() => null);
                                                                            const data = (existingRes as any)?.data !== undefined ? (existingRes as any).data : existingRes;
                                                                            
                                                                            if (data && data.qrContent && data.token && !data.qrContent.includes('token=null')) {
                                                                                magicLink = data.qrContent;
                                                                            } 
                                                                            
                                                                            // Nếu vẫn nuul hoặc link lỗi, bắt buộc chạy qua API generate để tạo
                                                                            if (!magicLink || magicLink.includes('token=null')) {
                                                                                const genRes = await ShareholderManage.generateQrLogin(targetId).catch(() => null);
                                                                                const genData = (genRes as any)?.data !== undefined ? (genRes as any).data : genRes;
                                                                                if (genData && genData.qrContent && genData.token && !genData.qrContent.includes('token=null')) {
                                                                                    magicLink = genData.qrContent;
                                                                                }
                                                                            }
                                                                        }
                                                                    } catch (e) {
                                                                        console.warn("Proxy Magic QR Error:", e);
                                                                    } finally {
                                                                        if (!magicLink || magicLink.includes('token=null')) {
                                                                            magicLink = `http://dhcd.vix.local/login?cccd=${sh.cccd}`;
                                                                        }
                                                                        message.destroy('printing_proxy');
                                                                    }
                                                                    
                                                                    printVotingCard({
                                                                        fullName: sh.fullName,
                                                                        cccd: sh.cccd,
                                                                        votingRights: votingRights,
                                                                        meetingTitle: meetings.find(m => m.id === selectedMeetingId)?.title || "Đại hội cổ đông 2026",
                                                                        magicLink
                                                                    });
                                                                } finally {
                                                                    setLoading(false);
                                                                }
                                                            }}
                                                            title="In thẻ cho người này"
                                                        />
                                                        <Button
                                                            type={isProxyCheckedIn ? "default" : "primary"}
                                                            size="small"
                                                            tabIndex={-1}
                                                            onClick={() => handleConfirmProxyAttendance(
                                                                p,
                                                                (p as any)._tempDelegated ?? p.sharesDelegated
                                                            )}
                                                            style={isProxyCheckedIn ? {} : { backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                                        >
                                                            {isProxyCheckedIn ? <SyncOutlined /> : <CheckOutlined />}
                                                            {isProxyCheckedIn ? ' Cập nhật' : ' Xác nhận'}
                                                        </Button>
                                                    </div>
                                                );
                                            }
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    )}

                    {/* Bảng Danh sách những người uỷ quyền cho cổ đông này (Incoming) */}
                    {currentBundle && currentBundle.incomingProxies && currentBundle.incomingProxies.length > 0 && (
                        <div className={styles.section} style={{ marginTop: 16, border: '1px solid #d9d9d9', backgroundColor: '#fff', borderRadius: 8, padding: 0, overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #f0f0f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ color: '#262626', margin: 0, fontSize: 16, fontWeight: 600 }}>Cổ đông này nhận uỷ quyền từ:</h2>
                                <span style={{ color: '#595959', fontSize: 12 }}>Tự động cộng dồn quyền biểu quyết</span>
                            </div>
                            <div style={{ padding: 12 }}>
                                <Table
                                    dataSource={currentBundle.incomingProxies}
                                    pagination={false}
                                    size="small"
                                    rowKey={(p: any) => p.delegationId}
                                    columns={[
                                        {
                                            title: 'Người uỷ quyền',
                                            key: 'delegatorInfo',
                                            render: (_: any, p: any) => (
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{p.delegatorParticipant.fullName}</div>
                                                    <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                                                        Mã: {p.delegatorParticipant.investorCode || 'N/A'} | CCCD: {p.delegatorParticipant.cccd}
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            title: 'SL Uỷ quyền',
                                            dataIndex: 'sharesDelegated',
                                            key: 'sharesDelegated',
                                            align: 'right',
                                            render: (val: number) => <b style={{ color: '#1890ff' }}>{val.toLocaleString()}</b>
                                        }
                                    ]}
                                />
                                <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#e6f7ff', borderRadius: 4, fontSize: 13 }}>
                                    <i className="fas fa-info-circle" style={{ color: '#1890ff', marginRight: 8 }} />
                                    Số cổ phần nhận uỷ quyền sẽ tự động được cộng vào <b>"Quyền biểu quyết"</b> khi cổ đông này điểm danh.
                                </div>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
}
