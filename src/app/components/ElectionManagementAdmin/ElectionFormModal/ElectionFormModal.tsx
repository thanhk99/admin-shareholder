'use client';

import { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { Election, ElectionRequest, ElectionType } from '@/app/types/election';
import { ElectionService } from '@/lib/api/election';

const { TextArea } = Input;
const { Option } = Select;

interface ElectionFormModalProps {
    visible: boolean;
    election: Election | null;
    meetingId: string;
    loading: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function ElectionFormModal({
    visible,
    election,
    meetingId,
    loading,
    onCancel,
    onSuccess,
}: ElectionFormModalProps) {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (election) {
                // Edit mode
                form.setFieldsValue({
                    title: election.title,
                    description: election.description,
                    electionType: election.electionType,
                    displayOrder: election.displayOrder,
                });
            } else {
                // Create mode
                form.resetFields();
                form.setFieldsValue({
                    displayOrder: 1,
                });
            }
        }
    }, [visible, election, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const data: ElectionRequest = {
                title: values.title,
                description: values.description,
                electionType: values.electionType,
                displayOrder: values.displayOrder,
            };

            if (election) {
                // Update
                await ElectionService.updateElection(election.id, data);
                message.success('Cập nhật bầu cử thành công');
            } else {
                // Create
                await ElectionService.createElection(meetingId, data);
                message.success('Tạo bầu cử mới thành công');
            }

            form.resetFields();
            onSuccess();
        } catch (error: any) {
            if (error.errorFields) {
                // Validation error
                return;
            }
            console.error('Error saving election:', error);
            message.error(election ? 'Không thể cập nhật bầu cử' : 'Không thể tạo bầu cử');
        }
    };

    return (
        <Modal
            title={election ? 'Chỉnh sửa bầu cử' : 'Tạo bầu cử mới'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText={election ? 'Cập nhật' : 'Tạo mới'}
            cancelText="Hủy"
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
            >
                <Form.Item
                    name="title"
                    label="Tiêu đề bầu cử"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                        { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự' },
                    ]}
                >
                    <Input
                        placeholder="VD: Bầu cử Hội đồng quản trị nhiệm kỳ 2026-2030"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mô tả' },
                        { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
                    ]}
                >
                    <TextArea
                        placeholder="VD: Bầu cử 5 thành viên Hội đồng quản trị cho nhiệm kỳ 2026-2030"
                        rows={4}
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                <Form.Item
                    name="electionType"
                    label="Loại bầu cử"
                    rules={[{ required: true, message: 'Vui lòng chọn loại bầu cử' }]}
                >
                    <Select
                        placeholder="Chọn loại bầu cử"
                        size="large"
                    >
                        <Option value="BOARD_OF_DIRECTORS">Hội đồng Quản trị</Option>
                        <Option value="SUPERVISORY_BOARD">Ban Kiểm soát</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="displayOrder"
                    label="Thứ tự hiển thị"
                    rules={[
                        { required: true, message: 'Vui lòng nhập thứ tự hiển thị' },
                        { type: 'number', min: 1, message: 'Thứ tự phải lớn hơn 0' },
                    ]}
                    tooltip="Thứ tự hiển thị của bầu cử trong danh sách (số nhỏ hơn sẽ hiển thị trước)"
                >
                    <InputNumber
                        min={1}
                        max={100}
                        style={{ width: '100%' }}
                        size="large"
                        placeholder="1"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
