import { Modal, Form, Input, Select, InputNumber } from 'antd';
import { VotingItem } from '@/app/types/resolution';
import styles from './ResolutionEditModal.module.css';
import { useEffect } from 'react';

const { TextArea } = Input;
const { Option } = Select;

interface ResolutionEditModalProps {
  isOpen: boolean;
  votingItem: VotingItem | null;
  onClose: () => void;
  onSave: (data: any) => void;
  loading?: boolean;
}

export default function ResolutionEditModal({
  isOpen,
  votingItem,
  onClose,
  onSave,
  loading = false
}: ResolutionEditModalProps) {

  const [form] = Form.useForm();

  useEffect(() => {
    if (isOpen && votingItem) {
      form.setFieldsValue({
        title: votingItem.title,
        description: votingItem.description,
        displayOrder: votingItem.displayOrder || 1,
      });
    }
  }, [isOpen, votingItem, form]);

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
      title="Chỉnh sửa Nội dung"
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
        className={styles.editForm}
        initialValues={votingItem || {}}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: 'Tiêu đề không được để trống' },
            { max: 500, message: 'Tiêu đề không được vượt quá 500 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tiêu đề" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { max: 1000, message: 'Mô tả không được vượt quá 1000 ký tự' }
          ]}
        >
          <TextArea
            placeholder="Nhập mô tả"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="displayOrder"
          label="Thứ tự hiển thị"
          rules={[
            {
              validator: (_, value) => {
                if (value < 0) {
                  return Promise.reject('Thứ tự hiển thị không được âm');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <div className={styles.readonlyInfo}>
          <div className={styles.readonlyItem}>
            <span>Ngày tạo:</span>
            <strong>
              {(() => {
                if (!votingItem?.createdAt) return '';
                const date = new Date(votingItem.createdAt);
                return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('vi-VN');
              })()}
            </strong>
          </div>
        </div>
      </Form>
    </Modal>
  );
}