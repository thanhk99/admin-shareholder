import { Form, Input, Button, AutoComplete, DatePicker, FormInstance, message, Typography, InputNumber, Row, Col } from 'antd';
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
    onCancelAttendance?: () => void;
    onOpenAddProxy?: () => void;
    isScanningRef?: React.RefObject<boolean>;
    lastCleanCccdRef?: React.RefObject<string | null>;
    rightContent?: React.ReactNode;
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
    onCancelAttendance,
    onOpenAddProxy,
    isScanningRef,
    lastCleanCccdRef,
    rightContent
}: ShareholderSearchFormProps) {
    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Thông tin cổ đông</h2>
                <Button
                    icon={<PrinterOutlined />}
                    onClick={onPrintQR}
                    size="small"
                    style={{ marginLeft: 'auto' }}
                >
                    In mã QR đăng nhập
                </Button>
            </div>
                <Row gutter={24}>
                    {/* Cột trái: Thông tin cổ đông + Xác nhận tham dự */}
                    <Col span={12}>
                        <Form form={form} layout="vertical">
                            <Form.Item name="id" noStyle><Input type="hidden" /></Form.Item>
                            <Form.Item name="investorCode" noStyle><Input type="hidden" /></Form.Item>
                            <Form.Item name="proxyUserId" noStyle><Input type="hidden" /></Form.Item>
                            <Form.Item name="delegatedShares" noStyle><Input type="hidden" /></Form.Item>
                            <Form.Item name="receivedProxyShares" noStyle><Input type="hidden" /></Form.Item>
                            <Form.Item name="cccd" noStyle><Input type="hidden" /></Form.Item>

                            <div className={styles.formGrid}>
                                <Form.Item label="Tra cứu CCCD" name="keyword">
                                    <div className={styles.idInput}>
                                        <AutoComplete
                                            options={searchOptions}
                                            onSearch={onQuickSearch}
                                            onSelect={onSelectShareholder}
                                            style={{ width: '100%' }}
                                            filterOption={false}
                                        >
                                            <Input
                                                size="small"
                                                placeholder="Nhập CCCD..."
                                                onPressEnter={onSearch}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                    const target = e.target as HTMLInputElement;
                                                    const val = target.value;

                                                    if (isScanningRef?.current && lastCleanCccdRef?.current) {
                                                        if (val.length > lastCleanCccdRef.current.length) {
                                                            target.value = lastCleanCccdRef.current;
                                                        } else {
                                                            (lastCleanCccdRef as any).current = val;
                                                        }
                                                        return;
                                                    }

                                                    if (val && (val.includes('|') || (val.length > 12 && /^\d{12}/.test(val)))) {
                                                        // Tách mã CCCD sạch (luôn là 12 số đầu hoặc phần trước dấu |)
                                                        const cleanCccd = val.includes('|') ? val.split('|')[0].replace('||', '').trim() : val.substring(0, 12);
                                                        
                                                        // Gán ngay lập tức vào DOM để không bị hiển thị chuỗi rác
                                                        target.value = cleanCccd;
                                                        
                                                        if (lastCleanCccdRef) (lastCleanCccdRef as any).current = cleanCccd;
                                                        if (isScanningRef) (isScanningRef as any).current = true;
                                                        
                                                        // Gọi hàm search với mã sạch
                                                        onQuickSearch(cleanCccd);
                                                    }
                                                }}
                                            />
                                        </AutoComplete>
                                        <Button
                                            size="small"
                                            type="primary"
                                            icon={<SearchOutlined />}
                                            onClick={onSearch}
                                            loading={loading}
                                        />
                                    </div>
                                </Form.Item>

                                <Form.Item label="Họ tên" name="fullName">
                                    <Input size="small" readOnly className={styles.readOnlyField} />
                                </Form.Item>
                                <Form.Item label="Ngày cấp" name="dateOfIssue">
                                    <DatePicker size="small" className={styles.readOnlyField} style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" disabled />
                                </Form.Item>
                                <Form.Item label="Số lượng CP" name="sharesOwned">
                                    <Input size="small" readOnly suffix="(cp)" className={styles.readOnlyField} />
                                </Form.Item>
                            </div>

                            {/* Phần xác nhận tham dự dời sang bên trái */}
                            <div style={{
                                marginTop: 24,
                                border: '1px solid #d9d9d9',
                                borderRadius: 8,
                                overflow: 'hidden',
                                display: shouldHideAttendance ? 'none' : 'block',
                                backgroundColor: '#fff'
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
                                                <span>Thời gian: <b style={{ color: '#1890ff' }}>{dayjs(checkedInAt).format('HH:mm DD/MM/YYYY')}</b></span>
                                            </div>
                                        )}
                                        
                                        <Form.Item
                                            label="Số lượng tham dự"
                                            name="attendingShares"
                                            style={{ marginBottom: 16 }}
                                            help={remainingToAllocate < 0 ? <span style={{ color: 'red' }}>Vượt quá số lượng có thể tham dự</span> : `Còn lại: ${displayRemaining.toLocaleString()} cp`}
                                        >
                                            <InputNumber
                                                size="small"
                                                style={{ width: '100%' }}
                                                min={0}
                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                                placeholder="Nhập số lượng CP tham dự"
                                            />
                                        </Form.Item>

                                        <div className={styles.actionRow} style={{ display: 'flex', gap: '12px' }}>
                                            <Button
                                                size="small"
                                                type="primary"
                                                className={styles.confirmButton}
                                                onClick={onConfirmAttendance}
                                                loading={loading}
                                                icon={isParticipated ? <EditOutlined /> : <CheckOutlined />}
                                            >
                                                {isParticipated ? 'Cập nhật' : 'Xác nhận tham dự'}
                                            </Button>
                                            {isParticipated && (
                                                <Button
                                                    size="small"
                                                    danger
                                                    onClick={onCancelAttendance}
                                                    loading={loading}
                                                >
                                                    Huỷ tham dự
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Form>
                    </Col>

                    {/* Cột phải: Dành cho form uỷ quyền (Children) */}
                    <Col span={12}>
                        {rightContent}
                    </Col>
                </Row>
        </div>
    );
}
