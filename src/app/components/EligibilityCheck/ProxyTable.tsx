import { Table, Typography, Tag, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { ProxyItem } from '@/app/types/proxy';
import styles from './EligibilityCheck.module.css';

const { Title } = Typography;

interface ProxyTableProps {
    proxyList: ProxyItem[];
    loading: boolean;
    onEditProxy: (proxy: ProxyItem) => void;
    onDeleteProxy: () => void;
}

const proxyColumns = [
    { title: 'Người nhận UQ', dataIndex: 'proxyId', key: 'proxyId' },
    { title: 'Họ tên người nhận UQ', dataIndex: 'proxyName', key: 'proxyName' },
    { title: 'Mã người UQ', dataIndex: 'delegatorId', key: 'delegatorId' },
    { title: 'Họ tên người UQ', dataIndex: 'delegatorName', key: 'delegatorName' },
    { title: 'Số lượng UQ', dataIndex: 'sharesDelegated', key: 'sharesDelegated', render: (val: number) => val?.toLocaleString() },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (val: string) => <Tag color={val === 'ACTIVE' ? 'green' : 'red'}>{val}</Tag> },
];

export default function ProxyTable({ proxyList, loading, onEditProxy, onDeleteProxy }: ProxyTableProps) {
    return (
        <>
            <div className={styles.tableSection}>
                <Title level={5}>Danh sách lượt ủy quyền</Title>
                <Table
                    columns={proxyColumns}
                    dataSource={proxyList}
                    size="small"
                    pagination={{ pageSize: 5 }}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => onEditProxy(record),
                        style: { cursor: 'pointer' }
                    })}
                />
            </div>

            <div className={styles.footerContainer}>
                <div className={styles.buttonGrid2x2}>
                    <Button className={styles.listButton}>Danh sách tham dự trực tiếp (F11)</Button>
                    <Button className={styles.listButton}>Danh sách cổ đông tham dự (F12)</Button>
                    <Button className={styles.listButton}>Danh sách người được UQ</Button>
                    <Button className={styles.listButton}>Danh sách cổ đông gửi UQ</Button>
                </div>
                <div className={styles.deleteButtonRow}>
                    <Button
                        danger
                        style={{ width: 'auto', minWidth: '120px' }}
                        icon={<DeleteOutlined />}
                        onClick={onDeleteProxy}
                        loading={loading}
                    >
                        Xóa UQ
                    </Button>
                </div>
            </div>
        </>
    );
}
