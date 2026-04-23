import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, message, Spin, AutoComplete, Typography } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import ShareholderManage from '@/lib/api/shareholdermanagement';
import ProxyService from '@/lib/api/proxy';
import { NonShareholderProxyRequest } from '@/app/types/proxy';

interface AddProxyModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
    meetingId: string;
    delegatorCccd: string;
    delegatorName: string;
    maxShares: number;
    renderInline?: boolean;
    active?: boolean;
}

const AddProxyModal = forwardRef(({
    open,
    onCancel,
    onSuccess,
    meetingId,
    delegatorCccd,
    delegatorName,
    maxShares,
    renderInline = false,
    active = true
}: AddProxyModalProps, ref) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [searchOptions, setSearchOptions] = useState<{ value: string; label: React.ReactNode; data: any }[]>([]);

    useImperativeHandle(ref, () => ({
        getFormValues: () => form.getFieldsValue()
    }));

    // Refs cho xử lý QR
    const qrTimerRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const isQRProcessingRef = useRef(false); // Cờ: đang trong luồng quét QR
    // Debounce timer cho tìm kiếm bằng nhập tay
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                meetingId,
                delegatorCccd,
                sharesDelegated: maxShares > 0 ? maxShares : 0
            });
        }
        return () => {
            if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [open, meetingId, delegatorCccd, form]);

    /**
     * Bóc tách dữ liệu từ chuỗi QR CCCD đầy đủ.
     * Định dạng: cccd||tên|ngàySinh|gioiTinh|diaChi|ngàyCấp
     */
    const parseQRString = (raw: string): { cccd: string; fullName: string; dateOfIssue: string } | null => {
        // Định dạng có dấu ||
        if (raw.includes('||')) {
            const mainParts = raw.split('||');
            if (mainParts.length >= 2) {
                const cccd = mainParts[0].trim();
                const infoParts = mainParts[1].split('|');
                const fullName = infoParts[0]?.trim() || '';
                const rawDate = infoParts[4]?.trim() || '';
                const dateOfIssue = rawDate.length === 8
                    ? `${rawDate.substring(0, 2)}/${rawDate.substring(2, 4)}/${rawDate.substring(4)}`
                    : rawDate;
                return { cccd, fullName, dateOfIssue };
            }
        }

        // Định dạng thô (12 số CCCD + tên + ngày trong chuỗi)
        if (raw.length > 12 && /^\d{12}/.test(raw)) {
            const cccd = raw.substring(0, 12);
            const remaining = raw.substring(12);
            const dobMatch = remaining.match(/\d{8}/);
            let fullName = '';
            let dateOfIssue = '';
            if (dobMatch && dobMatch.index !== undefined) {
                fullName = remaining.substring(0, dobMatch.index).trim();
                const rawDate = raw.substring(raw.length - 8);
                if (/^\d{8}$/.test(rawDate)) {
                    dateOfIssue = `${rawDate.substring(0, 2)}/${rawDate.substring(2, 4)}/${rawDate.substring(4)}`;
                }
            }
            return { cccd, fullName, dateOfIssue };
        }

        return null;
    };

    /**
     * Xử lý khi QR buffer đã đủ thời gian tích lũy (200ms sau ký tự cuối).
     * Lúc này mới thực sự bóc tách và điền form.
     */
    const processQRBuffer = (raw: string, target: HTMLInputElement) => {
        const parsed = parseQRString(raw);
        if (!parsed) {
            isQRProcessingRef.current = false;
            return;
        }

        // Làm sạch ô CCCD
        target.value = parsed.cccd;

        // Điền form
        form.setFieldsValue({
            cccd: parsed.cccd,
            ...(parsed.fullName ? { fullName: parsed.fullName } : {}),
            ...(parsed.dateOfIssue ? { dateOfIssue: parsed.dateOfIssue } : {})
        });

        isQRProcessingRef.current = false;
    };

    /**
     * Tìm kiếm cổ đông từ DB và nạp vào danh sách gợi ý (AutoComplete).
     */
    const handleSearchCCCD = async (cccd: string) => {
        if (!cccd || cccd.length < 1) {
            setSearchOptions([]);
            return;
        }
        setSearching(true);
        try {
            const response = await ShareholderManage.searchUsers(cccd);
            const data = (response as any)?.data || response;
            const users = Array.isArray(data) ? data : (data ? [data] : []);

            // Hiển thị tối đa 5 kết quả đầu tiên từ API trả về (Server đã thực hiện lọc theo từ khoá)
            const options = users.slice(0, 5).map((u: any) => ({
                value: u.cccd,
                label: (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography.Text strong>{u.cccd}</Typography.Text>
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{u.fullName}</Typography.Text>
                    </div>
                ),
                data: u
            }));
            setSearchOptions(options);

        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectCCCD = (value: string, option: any) => {
        const user = option.data;
        if (user) {
            if (user.cccd === delegatorCccd) {
                message.warning('Người được uỷ quyền không được trùng với người uỷ quyền');
                form.setFieldsValue({ cccd: '' });
                return;
            }

            form.setFieldsValue({
                fullName: user.fullName,
                dateOfIssue: user.dateOfIssue,
                phoneNumber: user.phoneNumber,
                nation: user.nation || 'Việt Nam',
                address: user.address || 'N/A'
            });
            message.success(`Đã chọn: ${user.fullName}`);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (values.cccd === delegatorCccd) {
                message.error('Người được uỷ quyền không được trùng với người uỷ quyền');
                return;
            }
            if (values.sharesDelegated <= 0) {
                message.error('Số lượng uỷ quyền phải lớn hơn 0');
                return;
            }
            if (values.sharesDelegated > maxShares) {
                message.error(`Số lượng uỷ quyền (${values.sharesDelegated.toLocaleString()} cp) vượt quá số cổ phần khả dụng (${maxShares.toLocaleString()} cp)`);
                return;
            }
            setLoading(true);
            const request: NonShareholderProxyRequest = {
                ...values,
                address: values.address || 'N/A',
                meetingId,
                delegatorCccd
            };
            await ProxyService.createNonShareholderProxy(request);
            message.success('Thêm người nhận uỷ quyền thành công');
            onSuccess();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi thêm uỷ quyền');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <Form form={form} layout="vertical" disabled={loading || !active}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Số CCCD/Passport"
                        name="cccd"
                        rules={[{ required: true, message: 'Vui lòng nhập CCCD' }]}
                    >
                        <AutoComplete
                            options={searchOptions}
                            onSelect={handleSelectCCCD}
                            onSearch={(val) => {
                                // Nếu đang trong luồng QR, bỏ qua nạp gợi ý để tránh nhiễu
                                if (isQRProcessingRef.current) return;
                                
                                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
                                searchTimerRef.current = setTimeout(() => {
                                    handleSearchCCCD(val);
                                }, 300);
                            }}
                            disabled={loading || !active}
                        >
                            <Input
                                ref={(el) => { inputRef.current = el?.input || null; }}
                                placeholder="Nhập hoặc quét CCCD..."
                                suffix={searching ? <Spin size="small" /> : <SearchOutlined style={{ color: '#bfbfbf' }} />}
                                tabIndex={5}
                                onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                    const target = e.target as HTMLInputElement;
                                    const raw = target.value;

                                    // Phát hiện dấu hiệu QR
                                    const looksLikeQR = raw.includes('|') || (raw.length > 12 && /^\d{12}/.test(raw));

                                    if (looksLikeQR) {
                                        isQRProcessingRef.current = true;
                                        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
                                        qrTimerRef.current = setTimeout(() => {
                                            processQRBuffer(target.value, target);
                                        }, 200);
                                    }
                                }}
                            />
                        </AutoComplete>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nhập họ tên người nhận uỷ quyền" tabIndex={6} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="Ngày cấp (CCCD)" name="dateOfIssue">
                        <Input placeholder="VD: 14/09/2021" tabIndex={-1} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Số điện thoại" name="phoneNumber">
                        <Input placeholder="Nhập số điện thoại" tabIndex={-1} />
                    </Form.Item>
                </Col>
            </Row>



            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Số cổ phần uỷ quyền"
                        name="sharesDelegated"
                        rules={[{ required: true, message: 'Vui lòng nhập số cổ phần' }]}
                        help={`Tối đa: ${maxShares.toLocaleString()} cp`}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') as any}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                            min={1}
                            tabIndex={7}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="Ghi chú" name="note">
                        <Input placeholder="Nhập ghi chú uỷ quyền" tabIndex={-1} />
                    </Form.Item>
                </Col>
            </Row>

            {/* Hidden fields */}
            <Form.Item name="meetingId" noStyle><Input type="hidden" /></Form.Item>
            <Form.Item name="delegatorCccd" noStyle><Input type="hidden" /></Form.Item>
            <Form.Item name="nation" noStyle initialValue="Việt Nam"><Input type="hidden" /></Form.Item>

            {renderInline && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <Button onClick={onCancel} disabled={!active} tabIndex={-1}>Hủy</Button>
                    <Button type="primary" loading={loading} onClick={handleSubmit} disabled={!active} tabIndex={8}>Xác nhận uỷ quyền</Button>
                </div>
            )}
        </Form>
    );

    if (renderInline) {
        if (!open) return null;
        return (
            <div style={{
                marginTop: 24,
                padding: '20px',
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                backgroundColor: active ? '#fafafa' : '#fff',
                opacity: active ? 1 : 0.6,
                filter: active ? 'none' : 'grayscale(50%)',
                position: 'relative',
                transition: 'all 0.3s'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <UserAddOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontWeight: 600, fontSize: '16px' }}>Uỷ quyền cho người khác (từ {delegatorName})</span>
                </div>
                {formContent}
            </div>
        );
    }

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserAddOutlined style={{ color: '#1890ff' }} />
                    <span>Uỷ quyền cho người khác (từ {delegatorName})</span>
                </div>
            }
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel} disabled={!active} tabIndex={-1}>Hủy</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit} disabled={!active} tabIndex={8}>
                    Xác nhận uỷ quyền
                </Button>
            ]}
            width={700}
        >
            {formContent}
        </Modal>
    );
});

export default AddProxyModal;
