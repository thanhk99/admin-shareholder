import styles from './CandidateFormModal.module.css';
import { CandidateRequest } from '@/app/types/candidate';
import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { VotingItem } from '@/app/types/resolution';

const { TextArea } = Input;
const { Option } = Select;

interface CandidateFormModalProps {
    showForm: boolean;
    formMode: 'create' | 'edit';
    initialData?: CandidateRequest;
    formLoading: boolean;
    onClose: () => void;
    onSubmit: (data: CandidateRequest, electionId: string) => void;
    elections: VotingItem[];
    defaultElectionId?: string;
}

export default function CandidateFormModal({
    showForm,
    formMode,
    initialData,
    formLoading,
    onClose,
    onSubmit,
    elections,
    defaultElectionId
}: CandidateFormModalProps) {
    const [form] = Form.useForm();
    const [selectedId, setSelectedId] = useState<string>('');

    useEffect(() => {
        if (showForm) {
            if (formMode === 'edit' && initialData) {
                form.setFieldsValue(initialData);
                if (defaultElectionId) setSelectedId(defaultElectionId);
            } else {
                form.resetFields();
                form.setFieldsValue({ displayOrder: 1 });
                if (defaultElectionId) {
                    setSelectedId(defaultElectionId);
                    form.setFieldsValue({ electionId: defaultElectionId });
                } else if (elections.length > 0) {
                    setSelectedId(elections[0].id);
                    form.setFieldsValue({ electionId: elections[0].id });
                }
            }
        }
    }, [showForm, formMode, initialData, defaultElectionId, elections, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const electionId = values.electionId || selectedId;
            const { electionId: _, ...candidateData } = values;
            onSubmit(candidateData as CandidateRequest, electionId);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={formMode === 'create' ? 'Thêm Ứng viên Mới' : 'Chỉnh sửa Ứng viên'}
            open={showForm}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={formLoading}
            okText={formMode === 'create' ? 'Thêm' : 'Cập nhật'}
            cancelText="Hủy"
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                autoComplete="off"
                initialValues={{ displayOrder: 1 }}
            >
                <Form.Item
                    name="electionId"
                    label="Loại bầu cử (Category)"
                    rules={[{ required: true, message: 'Vui lòng chọn loại bầu cử' }]}
                >
                    <Select placeholder="Chọn cuộc bầu cử">
                        {elections.map(election => (
                            <Option key={election.id} value={election.id}>
                                {election.title} ({(election as any).electionType === 'BOARD_OF_DIRECTORS' ? 'HĐQT' : 'BKS'})
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ tên ứng viên' }]}
                >
                    <Input placeholder="Nhập tên ứng viên" />
                </Form.Item>

                <Form.Item
                    name="position"
                    label="Vị trí/Chức vụ"
                    rules={[{ required: true, message: 'Vui lòng nhập vị trí' }]}
                >
                    <Input placeholder="VD: Ứng viên HĐQT" />
                </Form.Item>

                <Form.Item
                    name="displayOrder"
                    label="Thứ tự hiển thị"
                    rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
                >
                    <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item
                    name="photoUrl"
                    label="URL Ảnh đại diện"
                >
                    <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item
                    name="bio"
                    label="Tiểu sử / Giới thiệu"
                >
                    <TextArea rows={4} placeholder="Nhập thông tin giới thiệu về ứng viên..." />
                </Form.Item>
            </Form>
        </Modal>
    );
}
