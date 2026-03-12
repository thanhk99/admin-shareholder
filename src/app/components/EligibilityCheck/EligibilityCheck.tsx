'use client';
import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';

import { Form, Row, Col, Typography, message, Input, Button, Table, Tag, Collapse } from 'antd';
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
    UpOutlined
} from '@ant-design/icons';
import styles from './EligibilityCheck.module.css';

import MeetingStats from './MeetingStats';
import ShareholderSearchForm from './ShareholderSearchForm';
import AttendanceTable from './AttendanceTable';
import { useEligibilityData } from './useEligibilityData';
import { AttendanceService } from '@/lib/api/attendance';
import { DashboardService } from '@/lib/api/dashboard';
import ProxyService from '@/lib/api/proxy';
import AddProxyModal from './AddProxyModal';

const { Text } = Typography;

export default function EligibilityCheck() {
    const [form] = Form.useForm();
    const [isAttendanceSectionExpanded, setIsAttendanceSectionExpanded] = useState(true);

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
        handleBundleSearch
    } = useEligibilityData(form);

    const investorCodeWatch = Form.useWatch('investorCode', form);
    const sharesOwnedWatch = Form.useWatch('sharesOwned', form) || 0;
    const delegatedSharesWatch = Form.useWatch('delegatedShares', form) || 0;
    const receivedProxySharesWatch = Form.useWatch('receivedProxyShares', form) || 0;
    const attendingSharesWatch = Form.useWatch('attendingShares', form) || 0;

    // Tính số cổ phần tối đa có thể tham dự dựa trên công thức
    const maxAttendingShares = Number(sharesOwnedWatch) - Number(delegatedSharesWatch) + Number(receivedProxySharesWatch);

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

    const totalShareholders = summary?.userStats?.totalShareholders || 0;
    const totalShares = summary?.userStats?.totalSharesRepresented || 0;

    const attendedCount = summary?.userStats?.attendedCount || 0;
    const attendedShares = summary?.userStats?.attendedShares || 0;
    const participationRate = summary?.userStats?.participationRate || 0;

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
        const received = Number(values.receivedProxyShares) || 0;
        const maxAllowed = owned - delegated + received;

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
                investorCode: values.investorCode,
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

        const investorCode = form.getFieldValue('investorCode');
        if (!investorCode) {
            message.warning('Vui lòng chọn cổ đông');
            return;
        }

        setLoading(true);
        try {
            await AttendanceService.cancelAttendance(selectedMeetingId, investorCode);
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
        const identifier = proxyAttendee.proxyParticipant.investorCode || proxyAttendee.proxyParticipant.cccd;

        if (!selectedMeetingId || !identifier || !proxyAttendee.delegationId) {
            message.warning('Dữ liệu không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await ProxyService.updateProxyShares(
                selectedMeetingId,
                proxyAttendee.delegationId,
                newDelegatedShares
            );

            message.success(`Cập nhật số lượng phiếu uỷ quyền cho ${proxyAttendee.proxyParticipant.fullName} thành công`);

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

            <Row gutter={24} style={{ marginTop: 24 }}>
                <Col span={24}>
                    <ShareholderSearchForm
                        form={form}
                        loading={loading}
                        searchOptions={searchOptions}
                        remainingToAllocate={remainingToAllocate}
                        displayRemaining={displayRemaining}
                        isParticipated={!!currentBundle?.shareholder?.checkedInAt}
                        checkedInAt={currentBundle?.shareholder?.checkedInAt}
                        remainingToProxy={remainingToProxy}
                        isAttendanceSectionExpanded={isAttendanceSectionExpanded}
                        onToggleAttendanceSection={() => setIsAttendanceSectionExpanded(!isAttendanceSectionExpanded)}
                        shouldHideAttendance={isAddProxyModalOpen}
                        onQuickSearch={handleQuickSearch}
                        onSelectShareholder={(userId, option) => handleBundleSearch(option.data.cccd || option.data.investorCode)}
                        onBundleSearch={handleBundleSearch}
                        onConfirmAttendance={handleConfirmAttendance}
                        onCancelAttendance={handleCancelAttendance}
                        onOpenAddProxy={handleOpenAddProxy}
                        onSearch={() => {
                            const keyword = form.getFieldValue('keyword');
                            if (keyword) handleBundleSearch(keyword);
                        }}
                    />

                    <AddProxyModal
                        open={isAddProxyModalOpen}
                        onCancel={() => setIsAddProxyModalOpen(false)}
                        onSuccess={handleAddProxySuccess}
                        meetingId={selectedMeetingId || ""}
                        delegatorCccd={form.getFieldValue('cccd')}
                        delegatorName={form.getFieldValue('fullName')}
                        maxShares={remainingToProxy}
                        renderInline={true}
                    />

                    {/* Bảng Danh sách những người mà cổ đông này uỷ quyền cho (Outgoing) */}
                    {currentBundle && currentBundle.outgoingProxies && currentBundle.outgoingProxies.length > 0 && (
                        <div className={styles.section} style={{ marginTop: 24, border: '2px solid #ff4d4f', backgroundColor: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden', boxShadow: '0 4px 12px rgba(255, 77, 79, 0.15)' }}>
                            <div
                                style={{
                                    backgroundColor: '#ff4d4f',
                                    padding: '12px 20px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setIsAttendanceSectionExpanded(!isAttendanceSectionExpanded)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <h2 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Cổ đông này uỷ quyền cho những người sau:</h2>
                                    {isAttendanceSectionExpanded ? <UpOutlined style={{ color: '#fff' }} /> : <DownOutlined style={{ color: '#fff' }} />}
                                </div>
                                <span style={{ color: '#fff', fontSize: 12 }}>Xác nhận từng đại diện tham dự</span>
                            </div>
                            {isAttendanceSectionExpanded && (
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
                                                        <Button
                                                            type={isProxyCheckedIn ? "default" : "primary"}
                                                            size="small"
                                                            onClick={() => handleConfirmProxyAttendance(
                                                                p,
                                                                (p as any)._tempDelegated ?? p.sharesDelegated
                                                            )}
                                                            style={isProxyCheckedIn ? {} : { backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                                                        >
                                                            {isProxyCheckedIn ? <SyncOutlined /> : <CheckOutlined />}
                                                            {isProxyCheckedIn ? ' Cập nhật' : ' Xác nhận tham dự'}
                                                        </Button>
                                                    );
                                                }
                                            }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bảng Danh sách những người uỷ quyền cho cổ đông này (Incoming) */}
                    {currentBundle && currentBundle.incomingProxies && currentBundle.incomingProxies.length > 0 && (
                        <div className={styles.section} style={{ marginTop: 24, border: '2px solid #1890ff', backgroundColor: '#fff', borderRadius: 12, padding: 0, overflow: 'hidden', boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)' }}>
                            <div style={{ backgroundColor: '#1890ff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2 style={{ color: '#fff', margin: 0, fontSize: 16, fontWeight: 600 }}>Cổ đông này nhận uỷ quyền từ:</h2>
                                <span style={{ color: '#fff', fontSize: 12 }}>Tự động cộng dồn quyền biểu quyết</span>
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

            <Row gutter={24}>
                <Col span={24}>
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Dữ liệu tham dự hiện tại</h2>
                        </div>
                        <AttendanceTable
                            shareholdersList={shareholdersList}
                            onRowClick={() => { }}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
}
