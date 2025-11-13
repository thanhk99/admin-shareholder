// components/ShareholderLogs/ShareholderLogs.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Select, 
  DatePicker, 
  Tag, 
  Space,
  Empty
} from 'antd';
import { 
  HistoryOutlined, 
  UserOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './ShareholderLogs.module.css';
import ShareholderManage from '@/lib/api/shareholdermanagement';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface LogEntry {
  id: string;
  type: 'CANDIDATE_VOTE' | 'RESOLUTION_VOTE';
  resolutionCode?: string;
  candidateCode?: string;
  choice?: string;
  amount: number;
  typeAction: string;
  timestamp: string;
  shareholderCode: string;
  shareholderName: string;
  candidateName?: string;
  resolutionTitle?: string;
}

interface ShareholderLogsProps {
  shareholderCode?: string;
  showFilter?: boolean;
}

export default function ShareholderLogs({ shareholderCode, showFilter = true }: ShareholderLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    logType: 'ALL',
    dateRange: [] as dayjs.Dayjs[],
    actionType: 'ALL'
  });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (shareholderCode) {
        params.shareholderCode = shareholderCode;
      }
      
      if (filters.logType !== 'ALL') {
        params.type = filters.logType;
      }
      
      if (filters.dateRange.length === 2) {
        params.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        params.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      if (filters.actionType !== 'ALL') {
        params.action = filters.actionType;
      }

      const response = await ShareholderManage.getLogs(params);
      if (response.status === "success") {
        setLogs(response.data);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [shareholderCode, filters]);

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      'CREATE': 'green',
      'CHANGE_CHOICE': 'orange',
      'FIRST_VOTE': 'blue',
      'RE_CONFIRM': 'purple',
      'INCREASE_SHARES': 'cyan',
      'DECREASE_SHARES': 'volcano',
      'DELETE': 'red'
    };
    return colors[action] || 'default';
  };

  const getTypeIcon = (type: string) => {
    return type === 'CANDIDATE_VOTE' ? <TeamOutlined /> : <FileTextOutlined />;
  };

  const getChoiceText = (choice: string) => {
    const choices: { [key: string]: string } = {
      'AGREE': 'Đồng ý',
      'NOTAGREE': 'Không đồng ý',
      'NOIDEA': 'Không ý kiến'
    };
    return choices[choice] || choice;
  };

  const getChoiceColor = (choice: string) => {
    const colors: { [key: string]: string } = {
      'AGREE': 'green',
      'NOTAGREE': 'red',
      'NOIDEA': 'default'
    };
    return colors[choice] || 'default';
  };

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp: string) => (
        <div className={styles.timestamp}>
          {dayjs(timestamp).format('DD/MM/YYYY HH:mm')}
        </div>
      ),
      sorter: (a: LogEntry, b: LogEntry) => 
        dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix()
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag icon={getTypeIcon(type)} color={type === 'CANDIDATE_VOTE' ? 'blue' : 'green'}>
          {type === 'CANDIDATE_VOTE' ? 'Bầu cử' : 'Biểu quyết'}
        </Tag>
      ),
      filters: [
        { text: 'Bầu cử', value: 'CANDIDATE_VOTE' },
        { text: 'Biểu quyết', value: 'RESOLUTION_VOTE' }
      ],
      onFilter: (value: string, record: LogEntry) => record.type === value
    },
    {
      title: 'Hành động',
      dataIndex: 'typeAction',
      key: 'typeAction',
      width: 140,
      render: (typeAction: string) => (
        <Tag color={getActionColor(typeAction)}>
          {getActionText(typeAction)}
        </Tag>
      )
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (record: LogEntry) => (
        <div className={styles.content}>
          {record.type === 'CANDIDATE_VOTE' ? (
            <div className={styles.candidateContent}>
              <div className={styles.itemName}>
                <strong>{record.candidateName || `Ứng viên ${record.candidateCode}`}</strong>
              </div>
              <div className={styles.voteInfo}>
                <span className={styles.amount}>
                  Số phiếu: <strong>{record.amount}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.resolutionContent}>
              <div className={styles.itemName}>
                <strong>{record.resolutionTitle || `Nghị quyết ${record.resolutionCode}`}</strong>
              </div>
              <div className={styles.voteInfo}>
                {record.choice && (
                  <Tag color={getChoiceColor(record.choice)}>
                    {getChoiceText(record.choice)}
                  </Tag>
                )}
                <span className={styles.amount}>
                  Số cổ phần: <strong>{record.amount}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )
    },
    ...(shareholderCode ? [] : [{
      title: 'Cổ đông',
      dataIndex: 'shareholderName',
      key: 'shareholderName',
      width: 180,
      render: (name: string, record: LogEntry) => (
        <div className={styles.shareholderInfo}>
          <UserOutlined />
          <div>
            <div className={styles.shareholderName}>{name}</div>
            <div className={styles.shareholderCode}>{record.shareholderCode}</div>
          </div>
        </div>
      )
    } as any])
  ];

  const getActionText = (action: string) => {
    const texts: { [key: string]: string } = {
      'CREATE': 'Tạo mới',
      'CHANGE_CHOICE': 'Thay đổi lựa chọn',
      'FIRST_VOTE': 'Bầu lần đầu',
      'RE_CONFIRM': 'Xác nhận lại',
      'INCREASE_SHARES': 'Tăng cổ phần',
      'DECREASE_SHARES': 'Giảm cổ phần',
      'DELETE': 'Xóa'
    };
    return texts[action] || action;
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={styles.logsContainer}>
      <Card 
        title={
          <Space>
            <HistoryOutlined />
            Lịch sử hoạt động
            {shareholderCode && ` - ${shareholderCode}`}
          </Space>
        }
        extra={
          showFilter && (
            <Space>
              <Select
                value={filters.logType}
                onChange={(value) => handleFilterChange('logType', value)}
                style={{ width: 150 }}
                placeholder="Loại log"
              >
                <Option value="ALL">Tất cả loại</Option>
                <Option value="CANDIDATE_VOTE">Bầu cử</Option>
                <Option value="RESOLUTION_VOTE">Biểu quyết</Option>
              </Select>

              <Select
                value={filters.actionType}
                onChange={(value) => handleFilterChange('actionType', value)}
                style={{ width: 180 }}
                placeholder="Loại hành động"
              >
                <Option value="ALL">Tất cả hành động</Option>
                <Option value="CREATE">Tạo mới</Option>
                <Option value="CHANGE_CHOICE">Thay đổi lựa chọn</Option>
                <Option value="FIRST_VOTE">Bầu lần đầu</Option>
                <Option value="RE_CONFIRM">Xác nhận lại</Option>
                <Option value="INCREASE_SHARES">Tăng cổ phần</Option>
                <Option value="DECREASE_SHARES">Giảm cổ phần</Option>
              </Select>

              <RangePicker
                value={[
                  filters.dateRange[0] ?? null,
                  filters.dateRange[1] ?? null
                ]}
                onChange={(dates) => handleFilterChange('dateRange', dates || [])}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Space>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={logs}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bản ghi`
          }}
          scroll={{ x: 800 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu log"
              />
            )
          }}
        />
      </Card>
    </div>
  );
}