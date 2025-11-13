// components/ShareholderLogs/ShareholderLogs.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space,
  Empty
} from 'antd';
import { 
  HistoryOutlined,
  FileTextOutlined,
  TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './ShareholderLogs.module.css';
import ShareholderManage from '@/lib/api/shareholdermanagement';

interface LogEntry {
  resolutionCode?: string;
  choice?: string;
  before: string;
  after: string;
  timestamp: string;
}

interface ShareholderLogsProps {
  shareholderCode?: string;
  showFilter?: boolean;
}

export default function ShareholderLogs({ shareholderCode, showFilter = true }: ShareholderLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (page: number = 1) => {
    if (!shareholderCode) return;
    
    setLoading(true);
    try {
      const response = await ShareholderManage.getLogs(shareholderCode, page);
      
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
    fetchLogs(1);
  }, [shareholderCode]);

  // Xác định loại log dựa trên dữ liệu
  const getLogType = (log: LogEntry): 'RESOLUTION' | 'CANDIDATE' => {
    // Nếu có resolutionCode và choice là AGREE/NOIDEA/NOTAGREE → Biểu quyết
    if (log.resolutionCode && ['AGREE', 'NOIDEA', 'NOTAGREE'].includes(log.choice || '')) {
      return 'RESOLUTION';
    }
    // Ngược lại → Bầu cử
    return 'CANDIDATE';
  };

  const getTypeIcon = (log: LogEntry) => {
    const type = getLogType(log);
    return type === 'CANDIDATE' ? <TeamOutlined /> : <FileTextOutlined />;
  };

  const getTypeColor = (log: LogEntry) => {
    const type = getLogType(log);
    return type === 'CANDIDATE' ? 'blue' : 'green';
  };

  const getTypeText = (log: LogEntry) => {
    const type = getLogType(log);
    return type === 'CANDIDATE' ? 'Bầu cử' : 'Biểu quyết';
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

  const isVoteChange = (log: LogEntry) => {
    return log.before !== log.after;
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
      key: 'type',
      width: 100,
      render: (_: any, record: LogEntry) => (
        <Tag icon={getTypeIcon(record)} color={getTypeColor(record)}>
          {getTypeText(record)}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_: any, record: LogEntry) => (
        <Tag color={isVoteChange(record) ? 'orange' : 'green'}>
          {isVoteChange(record) ? 'Thay đổi' : 'Giữ nguyên'}
        </Tag>
      )
    },
    {
      title: 'Nội dung',
      key: 'content',
      render: (_: any, record: LogEntry) => {
        const type = getLogType(record);
        
        return (
          <div className={styles.content}>
            {type === 'CANDIDATE' ? (
              <div className={styles.candidateContent}>
                <div className={styles.itemName}>
                  <strong>{record.choice || 'Ứng viên'}</strong>
                </div>
                <div className={styles.voteInfo}>
                  <span className={styles.change}>
                    {record.before} → {record.after} phiếu
                  </span>
                  {isVoteChange(record) && (
                    <span className={styles.changeIndicator}>
                      {parseInt(record.after) > parseInt(record.before) ? '📈' : '📉'}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.resolutionContent}>
                <div className={styles.itemName}>
                  <strong>{record.resolutionCode || 'Nghị quyết'}</strong>
                </div>
                <div className={styles.choiceInfo}>
                  <div className={styles.choiceChange}>
                    <Tag color={getChoiceColor(record.before)}>
                      {getChoiceText(record.before)}
                    </Tag>
                    <span className={styles.arrow}>→</span>
                    <Tag color={getChoiceColor(record.after)}>
                      {getChoiceText(record.after)}
                    </Tag>
                  </div>
                  {isVoteChange(record) && (
                    <div className={styles.changeNote}>
                      Đã thay đổi lựa chọn
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  ];

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
      >
        <Table
          columns={columns}
          dataSource={logs.map((log, index) => ({ ...log, key: index }))}
          loading={loading}
          rowKey="key"
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