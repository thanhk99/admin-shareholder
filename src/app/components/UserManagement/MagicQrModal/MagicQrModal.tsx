import { Modal, QRCode, Space, Button, message } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRef } from 'react';

interface MagicQrModalProps {
    isOpen: boolean;
    onClose: () => void;
    qrContent: string;
    qrToken?: string;
    userName: string;
    onRegenerate?: () => void; // New prop
}

export default function MagicQrModal({ isOpen, onClose, qrContent, qrToken, userName, onRegenerate }: MagicQrModalProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    const downloadQRCode = () => {
        const canvas = qrRef.current?.querySelector<HTMLCanvasElement>('canvas');
        if (canvas) {
            const url = canvas.toDataURL();
            const a = document.createElement('a');
            a.download = `QR_Login_${userName}.png`;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    const copyLink = () => {
        if (qrContent) {
            navigator.clipboard.writeText(qrContent);
            message.success('Đã sao chép liên kết đăng nhập');
        }
    };

    return (
        <Modal
            title={`Mã QR Đăng nhập cho ${userName}`}
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="regenerate" onClick={onRegenerate} style={{ float: 'left' }} danger>
                    Tạo mới
                </Button>,
                <Button key="close" onClick={onClose}>
                    Đóng
                </Button>,
                <Button key="copy" icon={<CopyOutlined />} onClick={copyLink}>
                    Sao chép Link
                </Button>,
                <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={downloadQRCode}>
                    Tải QR Code
                </Button>
            ]}
            centered
            width={400}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
                <div ref={qrRef} style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                    <QRCode value={qrContent || 'https://example.com'} size={250} errorLevel="H" />
                </div>

                <div style={{ marginTop: 24, textAlign: 'center', color: '#666' }}>
                    <p>Quét mã QR này để đăng nhập ngay lập tức trên thiết bị khác.</p>
                    <p style={{ fontSize: '12px', marginTop: 8 }}>Token: {qrToken?.substring(0, 15)}...</p>
                </div>
            </div>
        </Modal>
    );
}
