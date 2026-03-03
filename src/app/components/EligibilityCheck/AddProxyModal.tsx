import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Row, Col, message, Spin } from 'antd';
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
}

export default function AddProxyModal({
    open,
    onCancel,
    onSuccess,
    meetingId,
    delegatorCccd,
    delegatorName,
    maxShares,
    renderInline = false
}: AddProxyModalProps) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);

    // Reset form when opened or when delegator changes
    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                meetingId,
                delegatorCccd,
                sharesDelegated: maxShares > 0 ? maxShares : 0
            });
        }
    }, [open, meetingId, delegatorCccd, form]);
    // Bỏ maxShares khỏi dependency để tránh reset khi người dùng đang nhập liệu 
    // nhưng giá trị maxShares bên ngoài thay đổi do gõ phím ở form khác.

    const handleSearchCCCD = async (cccd: string) => {
        if (!cccd || cccd.length < 9) {
            // Xoá trắng các trường nếu CCCD quá ngắn hoặc bị xoá
            form.setFieldsValue({
                fullName: undefined,
                dateOfIssue: undefined,
                placeOfIssue: undefined,
                phoneNumber: undefined
            });
            return;
        }

        setSearching(true);
        try {
            const response = await ShareholderManage.searchUsers(cccd);
            const users = (response as any)?.data || response;

            if (Array.isArray(users) && users.length > 0) {
                // Chỉ lấy user nếu khớp chính xác CCCD
                const user = users.find((u: any) => u.cccd === cccd);

                if (user) {
                    form.setFieldsValue({
                        fullName: user.fullName,
                        dateOfIssue: user.dateOfIssue,
                        placeOfIssue: user.placeOfIssue,
                        phoneNumber: user.phoneNumber,
                        nation: user.nation
                    });
                    message.success('Đã tìm thấy thông tin người dùng trong hệ thống');
                } else {
                    // Nếu tìm thấy danh sách nhưng không có user nào khớp chính xác CCCD
                    form.setFieldsValue({
                        fullName: undefined,
                        dateOfIssue: undefined,
                        placeOfIssue: undefined,
                        phoneNumber: undefined
                    });
                }
            } else {
                // Nếu không tìm thấy bất kỳ user nào
                form.setFieldsValue({
                    fullName: undefined,
                    dateOfIssue: undefined,
                    placeOfIssue: undefined,
                    phoneNumber: undefined
                });
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (values.sharesDelegated > maxShares) {
                message.error(`Số lượng uỷ quyền (${values.sharesDelegated.toLocaleString()} cp) vượt quá số cổ phần khả dụng (${maxShares.toLocaleString()} cp)`);
                return;
            }

            setLoading(true);
            const request: NonShareholderProxyRequest = {
                ...values,
                address: values.address || "N/A", // Giá trị mặc định vì trường đã bị xoá khỏi UI nhưng BE có thể yêu cầu
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
        <Form form={form} layout="vertical" disabled={loading}>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Số CCCD/Passport"
                        name="cccd"
                        rules={[{ required: true, message: 'Vui lòng nhập CCCD' }]}
                    >
                        <Input
                            placeholder="Nhập CCCD để tìm kiếm..."
                            suffix={searching ? <Spin size="small" /> : <SearchOutlined style={{ color: '#bfbfbf' }} />}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.length >= 9) handleSearchCCCD(val);
                            }}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nhập họ tên người nhận uỷ quyền" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        label="Ngày cấp (CCCD)"
                        name="dateOfIssue"
                    >
                        <Input placeholder="VD: 01/01/2021" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Nơi cấp"
                        name="placeOfIssue"
                    >
                        <Input placeholder="VD: Cục CSQLHC về trật tự xã hội" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Form.Item
                        label="Số điện thoại"
                        name="phoneNumber"
                    >
                        <Input placeholder="Nhập số điện thoại" />
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
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        label="Ghi chú"
                        name="note"
                    >
                        <Input placeholder="Nhập ghi chú uỷ quyền" />
                    </Form.Item>
                </Col>
            </Row>

            {/* Hidden fields */}
            <Form.Item name="meetingId" noStyle><Input type="hidden" /></Form.Item>
            <Form.Item name="delegatorCccd" noStyle><Input type="hidden" /></Form.Item>
            <Form.Item name="nation" noStyle initialValue="Việt Nam"><Input type="hidden" /></Form.Item>

            {renderInline && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <Button onClick={onCancel}>Hủy</Button>
                    <Button type="primary" loading={loading} onClick={handleSubmit}>Xác nhận uỷ quyền</Button>
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
                backgroundColor: '#fafafa'
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
                <Button key="back" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Xác nhận uỷ quyền
                </Button>
            ]}
            width={700}
        >
            {formContent}
        </Modal>
    );
}
