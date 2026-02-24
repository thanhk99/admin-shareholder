import { Form, Input, Button, AutoComplete, DatePicker, FormInstance } from 'antd';
import { SearchOutlined, QrcodeOutlined, PrinterOutlined } from '@ant-design/icons';
import { Shareholder } from '@/app/types/shareholder';
import styles from './EligibilityCheck.module.css';

interface ShareholderSearchFormProps {
    form: FormInstance;
    loading: boolean;
    searchOptions: { value: string; label: React.ReactNode; data: Shareholder }[];
    remainingToAllocate: number;
    displayRemaining: number;
    onQuickSearch: (keyword: string) => void;
    onSelectShareholder: (value: string, option: any) => void;
    onSearch: () => void;
    onQRScan: () => void;
    onPrintQR: () => void;
    onConfirmAttendance: () => void;
}

export default function ShareholderSearchForm({
    form,
    loading,
    searchOptions,
    remainingToAllocate,
    displayRemaining,
    onQuickSearch,
    onSelectShareholder,
    onSearch,
    onQRScan,
    onPrintQR,
    onConfirmAttendance
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
                    <Form.Item
                        label="Số lượng tham dự"
                        name="attendingShares"
                        help={remainingToAllocate < 0 ? <span style={{ color: 'red' }}>Vượt quá số lượng sở hữu</span> : `Còn lại: ${displayRemaining.toLocaleString()} cp`}
                    >
                        <Input
                            type="text"
                            inputMode="numeric"
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
                        onClick={onConfirmAttendance}
                    >
                        Xác nhận số lượng tham dự
                    </Button>
                </div>
            </Form>
        </div>
    );
}
