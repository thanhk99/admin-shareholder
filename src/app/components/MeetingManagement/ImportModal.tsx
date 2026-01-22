'use client';

import { useState, useEffect } from 'react';
import { Modal, Upload, Button, message, Space, Typography, Select, Radio } from 'antd';
import { InboxOutlined, FileExcelOutlined } from '@ant-design/icons';
import { ImportService } from '@/lib/api/import';
import { MeetingService } from '@/lib/api/meetings';
import { Meeting } from '@/app/types/meeting';

const { Dragger } = Upload;
const { Text } = Typography;
const { Option } = Select;

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    meetingId?: string | null;
    importType?: 'shareholders' | 'proxies' | null;
    onSuccess?: () => void;
}

export default function ImportModal({
    isOpen,
    onClose,
    meetingId: propMeetingId,
    importType: propImportType,
    onSuccess,
}: ImportModalProps) {
    const [fileList, setFileList] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(propMeetingId || null);
    const [selectedImportType, setSelectedImportType] = useState<'shareholders' | 'proxies'>(propImportType || 'shareholders');
    const [loadingMeetings, setLoadingMeetings] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFileList([]); // Clear file list on open
            setSelectedMeetingId(propMeetingId || null);
            setSelectedImportType(propImportType || 'shareholders');
            if (!propMeetingId) {
                fetchMeetings();
            }
        }
    }, [isOpen, propMeetingId, propImportType]);

    const fetchMeetings = async () => {
        try {
            setLoadingMeetings(true);
            const meetingsData = await MeetingService.getAllMeetings();
            const data = Array.isArray(meetingsData) ? meetingsData : (meetingsData as any).data || [];
            setMeetings(data);
        } catch (error) {
            console.error('Error fetching meetings:', error);
            message.error('Không thể tải danh sách cuộc họp');
        } finally {
            setLoadingMeetings(false);
        }
    };

    const handleUpload = async () => {
        if (!selectedMeetingId || fileList.length === 0) {
            message.warning('Vui lòng chọn cuộc họp và file Excel');
            return;
        }

        const file = fileList[0];
        setUploading(true);

        try {
            if (selectedImportType === 'shareholders') {
                await ImportService.importShareholders(selectedMeetingId, file as any);
            } else {
                await ImportService.importProxies(selectedMeetingId, file as any);
            }
            message.success(`Nhập dữ liệu ${selectedImportType === 'shareholders' ? 'cổ đông' : 'uỷ quyền'} thành công`);
            onClose();
            setFileList([]);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error('Import error:', error);
            message.error(error.response?.data?.message || `Lỗi khi nhập dữ liệu ${selectedImportType === 'shareholders' ? 'cổ đông' : 'uỷ quyền'}`);
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        onRemove: (file: any) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: (file: any) => {
            const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.name.endsWith('.xlsx');
            if (!isExcel) {
                message.error('Chỉ chấp nhận file Excel (.xlsx)');
                return Upload.LIST_IGNORE;
            }
            setFileList([file]);
            return false;
        },
        fileList,
        maxCount: 1,
    };

    return (
        <Modal
            title={`Nhập danh sách ${selectedImportType === 'shareholders' ? 'Cổ đông' : 'Uỷ quyền'}`}
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="back" onClick={onClose}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={uploading}
                    onClick={handleUpload}
                    disabled={fileList.length === 0 || !selectedMeetingId}
                >
                    Tải lên
                </Button>,
            ]}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
                {!propMeetingId && (
                    <div>
                        <Text strong>Chọn cuộc họp:</Text>
                        <Select
                            style={{ width: '100%', marginTop: '8px' }}
                            placeholder="Chọn cuộc họp để nhập dữ liệu"
                            value={selectedMeetingId}
                            onChange={setSelectedMeetingId}
                            loading={loadingMeetings}
                        >
                            {meetings.map(m => (
                                <Option key={m.id} value={m.id}>{m.title}</Option>
                            ))}
                        </Select>
                    </div>
                )}

                {!propImportType && (
                    <div>
                        <Text strong>Loại nhập liệu:</Text>
                        <div style={{ marginTop: '8px' }}>
                            <Radio.Group
                                value={selectedImportType}
                                onChange={(e) => setSelectedImportType(e.target.value)}
                            >
                                <Radio value="shareholders">Danh sách Cổ đông</Radio>
                                <Radio value="proxies">Danh sách Uỷ quyền</Radio>
                            </Radio.Group>
                        </div>
                    </div>
                )}

                <div>
                    <Text strong>File Excel:</Text>
                    <div style={{ marginTop: '8px' }}>
                        <Dragger {...uploadProps}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Nhấp hoặc kéo thả file Excel vào đây</p>
                            <p className="ant-upload-hint">
                                Hỗ trợ file đơn (.xlsx).
                            </p>
                        </Dragger>
                    </div>
                </div>

                {fileList.length > 0 && (
                    <div>
                        <Space>
                            <FileExcelOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                            <Text strong>{fileList[0].name}</Text>
                        </Space>
                    </div>
                )}
            </div>
        </Modal>
    );
}
