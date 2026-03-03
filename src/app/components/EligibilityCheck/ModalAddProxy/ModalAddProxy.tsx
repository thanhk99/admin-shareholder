import { ProxyRequest } from "@/app/types/proxy";
import { Form, Modal } from "antd";


interface AddProxyFormModalProps {
    visible: boolean;
    proxy: ProxyRequest | null;
    meetingId: string;
    loading: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

export default function ModalAddProxy({
    visible,
    proxy,
    meetingId,
    loading,
    onCancel,
    onSuccess,
}: AddProxyFormModalProps) {
    const [form] = Form.useForm();

    const handleSubmit = async () => {

    }

    return (
        <Modal
            title={'Thêm người uỷ quyền'}
            open={visible}
            onOk={handleSubmit}
            onCancel={onCancel}
            confirmLoading={loading}
            okText={'Thêm mới '}
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
                    label="Họ Và Tên"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tiêu đề' },
                        { message: 'Họ Và Tên' },
                    ]}
                >
                </Form.Item>

                <Form.Item
                    name="title"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập Số Điện thoại' },
                        { min: 10, message: 'Số Điện thoại' },
                    ]}
                >
                </Form.Item>
            </Form>
        </Modal>
    )
}