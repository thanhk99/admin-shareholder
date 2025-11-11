import { Modal, Form, Input, InputNumber } from 'antd';
import { Resolution } from '@/app/types/resolution';
import styles from './ResolutionEditModal.module.css';

const { TextArea } = Input;

interface ResolutionEditModalProps {
  isOpen: boolean;
  resolution: Resolution | null;
  onClose: () => void;
  onSave: (data: any) => void;
  loading?: boolean;
}

export default function ResolutionEditModal({ 
  isOpen, 
  resolution, 
  onClose, 
  onSave,
  loading = false 
}: ResolutionEditModalProps) {
  
  const [form] = Form.useForm();

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Chỉnh sửa Nghị quyết"
      open={isOpen}
      onCancel={handleClose}
      onOk={handleSave}
      confirmLoading={loading}
      okText="Lưu thay đổi"
      cancelText="Huỷ"
      width={600}
      centered={true} 
      style={{ top: 20 }} 
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={resolution || {}}
        className={styles.editForm}
      >
        <Form.Item
          name="resolutionCode"
          label="Mã nghị quyết"
          rules={[
            { required: true, message: 'Vui lòng nhập mã nghị quyết' },
            { max: 50, message: 'Mã nghị quyết không được vượt quá 50 ký tự' }
          ]}
        >
          <Input placeholder="Nhập mã nghị quyết" />
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề' },
            { max: 500, message: 'Tiêu đề không được vượt quá 500 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tiêu đề nghị quyết" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { max: 1000, message: 'Mô tả không được vượt quá 1000 ký tự' }
          ]}
        >
          <TextArea 
            placeholder="Nhập mô tả nghị quyết"
            rows={4}
          />
        </Form.Item>

        <div className={styles.readonlyInfo}>
          <div className={styles.readonlyItem}>
            <span>Người tạo:</span>
            <strong>{resolution?.createBy}</strong>
          </div>
          <div className={styles.readonlyItem}>
            <span>Ngày tạo:</span>
            <strong>
              {resolution ? new Date(resolution.createdAt).toLocaleDateString('vi-VN') : ''}
            </strong>
          </div>
        </div>
      </Form>
    </Modal>
  );
}