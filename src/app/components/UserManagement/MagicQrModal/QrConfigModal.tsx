import { Modal, DatePicker, Button, Form, message } from 'antd';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

interface QrConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerate: (expiresAt?: string) => void;
    loading: boolean;
}

export default function QrConfigModal({ isOpen, onClose, onGenerate, loading }: QrConfigModalProps) {
    const [expiresAt, setExpiresAt] = useState<Dayjs | null>(null);

    const handleGenerate = () => {
        onGenerate(expiresAt ? expiresAt.toISOString() : undefined);
    };

    return (
        <Modal
            title="Cấu hình mã QR"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose} disabled={loading}>
                    Hủy
                </Button>,
                <Button key="generate" type="primary" onClick={handleGenerate} loading={loading}>
                    Tạo mã QR
                </Button>
            ]}
            centered
            width={400}
        >
            <div style={{ padding: '20px 0' }}>
                <Form layout="vertical">
                    <Form.Item label="Thời hạn hiệu lực (Tùy chọn)">
                        <DatePicker
                            showTime
                            style={{ width: '100%' }}
                            placeholder="Chọn thời điểm hết hạn (Mặc định 24h)"
                            value={expiresAt}
                            onChange={(date) => setExpiresAt(date)}
                            minDate={dayjs()}
                        />
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
                            Nếu không chọn, mã QR sẽ tự động hết hạn sau 24 giờ.
                        </div>
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
}
