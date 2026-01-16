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
    const [messageApi, contextHolder] = message.useMessage();

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

    const copyLink = async () => {
        if (qrContent) {
            try {
                await navigator.clipboard.writeText(qrContent);
                messageApi.success('Đã sao chép liên kết đăng nhập');
            } catch (err) {
                messageApi.error('Lỗi khi sao chép');
            }
        }
    };

    return (
        <>
            {contextHolder}
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
                        <p style={{ fontSize: '12px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            Token: {qrToken?.substring(0, 15)}...
                            <Button
                                type="text"
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={async () => {
                                    if (qrToken) {
                                        try {
                                            await navigator.clipboard.writeText(qrToken);
                                            messageApi.success('Đã sao chép Token');
                                        } catch (err) {
                                            messageApi.error('Lỗi khi sao chép Token');
                                        }
                                    }
                                }}
                                title="Sao chép Token"
                            />
                        </p>
                    </div>
                </div>
            </Modal>
        </>
    );
}
