import { Table, Typography } from 'antd';
import { Shareholder } from '@/app/types/shareholder';
import styles from './EligibilityCheck.module.css';

const { Title } = Typography;

interface AttendanceTableProps {
    shareholdersList: Shareholder[];
    onRowClick: (record: any) => void;
}

const shareholderColumns = [
    { title: 'Mã CĐ', dataIndex: 'shareholderCode', key: 'shareholderCode' },
    { title: 'Số CMND/Hộ...', dataIndex: 'cccd', key: 'cccd' },
    { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Tổng sở hữu', dataIndex: 'sharesOwned', key: 'sharesOwned', render: (val: number) => val?.toLocaleString() },
    { title: 'SL Tham dự', dataIndex: 'attendingShares', key: 'attendingShares', render: (val: number) => val?.toLocaleString() },
    { title: 'Đã ủy quyền', dataIndex: 'delegatedShares', key: 'delegatedShares', render: (val: number) => val?.toLocaleString() },
    { title: 'SPCP được UQ', dataIndex: 'receivedProxyShares', key: 'receivedProxyShares', render: (val: number) => val?.toLocaleString() },
    { title: 'Quyền biểu quyết', dataIndex: 'totalShares', key: 'totalShares', render: (val: number) => val?.toLocaleString() },
];

export default function AttendanceTable({ shareholdersList, onRowClick }: AttendanceTableProps) {
    return (
        <div className={styles.tableSection}>
            <Title level={5}>Danh sách cổ đông đã xác nhận</Title>
            <Table
                columns={shareholderColumns}
                dataSource={shareholdersList}
                size="small"
                pagination={{ pageSize: 5 }}
                rowKey={(record: any) => record.shareholderCode || record.investorCode || record.id}
                onRow={(record) => ({
                    onClick: () => onRowClick(record),
                    style: { cursor: 'pointer' }
                })}
            />
        </div>
    );
}
