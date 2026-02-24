import { Form, Input, Checkbox, Space, Typography, AutoComplete, DatePicker, Button, Divider, FormInstance } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { Shareholder } from '@/app/types/shareholder';
import styles from './EligibilityCheck.module.css';

const { Text } = Typography;

interface ProxyFormProps {
    form: FormInstance;
    isProxy: boolean;
    proxySearchOptions: { value: string; label: React.ReactNode; data: Shareholder }[];
    remainingToAllocate: number;
    displayRemaining: number;
    onProxyChange: (checked: boolean) => void;
    onProxyQuickSearch: (keyword: string) => void;
    onSelectProxy: (value: string, option: any) => void;
    onSaveProxy: () => void;
}

export default function ProxyForm({
    form,
    isProxy,
    proxySearchOptions,
    remainingToAllocate,
    displayRemaining,
    onProxyChange,
    onProxyQuickSearch,
    onSelectProxy,
    onSaveProxy
}: ProxyFormProps) {
    return (
        <Form form={form} component={false}>
            <Divider />
            <Space size="large" align="center" style={{ marginBottom: 16 }}>
                <Form.Item name="isProxy" valuePropName="checked" noStyle>
                    <Checkbox onChange={(e) => onProxyChange(e.target.checked)}>Ủy quyền biểu quyết</Checkbox>
                </Form.Item>
                {isProxy && (
                    <Space>
                        <Text strong>Số lượng:</Text>
                        <Form.Item name="proxyShares" noStyle>
                            <Input
                                type="text"
                                inputMode="numeric"
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
                                onSearch={onProxyQuickSearch}
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
                            onClick={onSaveProxy}
                        >
                            Lưu thông tin Ủy quyền (Ctr+S)
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}
