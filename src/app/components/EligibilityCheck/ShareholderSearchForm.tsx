import { Form, Input, Button, AutoComplete, DatePicker, FormInstance, message, Typography, InputNumber } from 'antd';
import { ClockCircleOutlined, DownOutlined, UpOutlined, SearchOutlined, QrcodeOutlined, PrinterOutlined, CheckOutlined, UserAddOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Shareholder } from '@/app/types/shareholder';
import styles from './EligibilityCheck.module.css';

interface ShareholderSearchFormProps {
    form: FormInstance;
    loading: boolean;
    searchOptions: { value: string; label: React.ReactNode; data: Shareholder }[];
    remainingToAllocate?: number;
    displayRemaining?: number;
    isParticipated?: boolean;
    checkedInAt?: string | null;
    remainingToProxy?: number;
    isAttendanceSectionExpanded?: boolean;
    onToggleAttendanceSection?: () => void;
    shouldHideAttendance?: boolean;
    onQuickSearch: (keyword: string) => void;
    onSelectShareholder: (value: string, option: any) => void | Promise<void>;
    onBundleSearch: (keyword: string) => Promise<void>;
    onSearch?: () => void;
    onQRScan?: () => void;
    onPrintQR?: () => void;
    onConfirmAttendance: () => void;
    onOpenAddProxy?: () => void;
}

export default function ShareholderSearchForm({
    form,
    loading,
    searchOptions,
    remainingToAllocate = 0,
    displayRemaining = 0,
    isParticipated = false,
    checkedInAt = null,
    remainingToProxy = 0,
    isAttendanceSectionExpanded = true,
    onToggleAttendanceSection,
    shouldHideAttendance = false,
    onQuickSearch,
    onSelectShareholder,
    onBundleSearch,
    onSearch = () => { },
    onQRScan = () => { },
    onPrintQR = () => { },
    onConfirmAttendance,
    onOpenAddProxy
}: ShareholderSearchFormProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Thông tin cổ đông</h2>
                <Button
                    icon={<PrinterOutlined />}
                    onClick={onPrintQR}
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
                <Form.Item name="delegatedShares" noStyle>
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item name="receivedProxyShares" noStyle>
                    <Input type="hidden" />
                </Form.Item>
                <div className={styles.formGrid}>
                    <Form.Item label="Tra cứu (Mã CĐ/CCCD)" name="keyword">
                        <div className={styles.idInput}>
                            <AutoComplete
                                options={searchOptions}
                                onSearch={onQuickSearch}
                                onSelect={onSelectShareholder}
                                style={{ width: '100%' }}
                                filterOption={false}
                            >
                                <Input
                                    placeholder="Nhập mã hoặc CCCD..."
                                    onPressEnter={onSearch}
                                />
                            </AutoComplete>
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                onClick={onSearch}
                                loading={loading}
                            />
                            <Button
                                icon={<QrcodeOutlined />}
                                onClick={onQRScan}
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
                </div>

                <div style={{
                    marginTop: 24,
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    overflow: 'hidden',
                    display: shouldHideAttendance ? 'none' : 'block'
                }}>
                    <div
                        style={{
                            padding: '12px 16px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            borderBottom: isAttendanceSectionExpanded ? '1px solid #d9d9d9' : 'none'
                        }}
                        onClick={onToggleAttendanceSection}
                    >
                        <h3 style={{ margin: 0, fontSize: 16 }}>Xác nhận tham dự</h3>
                        {isAttendanceSectionExpanded ? <UpOutlined /> : <DownOutlined />}
                    </div>

                    {isAttendanceSectionExpanded && (
                        <div style={{ padding: 16 }}>
                            {isParticipated && checkedInAt && (
                                <div style={{ marginBottom: 16, padding: '8px 12px', backgroundColor: '#e6f7ff', borderRadius: 4, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #91d5ff' }}>
                                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                                    <span>Thời gian tham dự: <b style={{ color: '#1890ff' }}>{dayjs(checkedInAt).format('HH:mm DD/MM/YYYY')}</b></span>
                                </div>
                            )}
                            <div className={styles.formGrid} style={{ marginBottom: 16 }}>
                                <Form.Item
                                    label="Số lượng tham dự"
                                    name="attendingShares"
                                    style={{ marginBottom: 0 }}
                                    help={remainingToAllocate < 0 ? <span style={{ color: 'red' }}>Vượt quá số lượng có thể tham dự</span> : `Còn lại: ${displayRemaining.toLocaleString()} cp`}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={0}
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                        placeholder="Nhập số lượng CP tham dự"
                                    />
                                </Form.Item>
                            </div>
                            <div className={styles.actionRow} style={{ gap: '12px' }}>
                                <Button
                                    type="primary"
                                    className={styles.confirmButton}
                                    onClick={onConfirmAttendance}
                                    loading={loading}
                                    icon={isParticipated ? <EditOutlined /> : <CheckOutlined />}
                                >
                                    {isParticipated ? 'Cập nhật' : 'Xác nhận số lượng tham dự'}
                                </Button>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <Button
                                        type="default"
                                        style={{ backgroundColor: '#1890ff', color: '#fff', borderColor: '#1890ff' }}
                                        icon={<UserAddOutlined />}
                                        onClick={() => {
                                            const values = form.getFieldsValue();
                                            if (values.investorCode) {
                                                onOpenAddProxy?.();
                                            } else {
                                                message.warning('Vui lòng chọn cổ đông uỷ quyền');
                                            }
                                        }}
                                    >
                                        Uỷ quyền cho người khác
                                    </Button>
                                    <div style={{ fontSize: '11px', color: '#8c8c8c', textAlign: 'center' }}>
                                        Có thể uỷ quyền thêm: <b>{remainingToProxy.toLocaleString()}</b> cp
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Form>
        </div>
    );
}
