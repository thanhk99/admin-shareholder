'use client';

import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { useRealtime } from '@/lib/context/RealtimeContext';
import { Progress, Card, List, Typography, Space } from 'antd';
import { CheckCircleOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import AddShareholderModal from '../UserManagement/AddShareholderModal/AddShareholderModal';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { realtimeStatus, isConnected } = useRealtime();

  const handleAddSuccess = () => {
    // Refresh logic if needed
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <Title level={2}>Bảng điều khiển & Kết quả trực tiếp</Title>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className={`${styles.statusIndicator} ${isConnected ? styles.active : styles.inactive}`} />
          <Text>{isConnected ? 'Kết nối ổn định' : 'Mất kết nối'}</Text>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {!realtimeStatus ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px' }}>
            <Text type="secondary">Chưa có dữ liệu biểu quyết realtime...</Text>
          </div>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Resolutions Section */}
            {realtimeStatus.resolutionResults && realtimeStatus.resolutionResults.length > 0 && (
              <Card title={<Space><BarChartOutlined /> Kết quả Biểu quyết</Space>} className={styles.statsCard}>
                <List
                  grid={{ gutter: 16, column: 1 }}
                  dataSource={realtimeStatus.resolutionResults}
                  renderItem={(res) => (
                    <List.Item>
                      <Card type="inner" title={res.resolutionTitle} size="small">
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong>Tổng số phiếu: {res.totalVoters}</Text> | <Text strong>Tổng quyền biểu quyết: {res.totalWeight.toLocaleString()}</Text>
                        </div>
                        {res.results.map((opt) => (
                          <div key={opt.votingOptionId} style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <Text>{opt.votingOptionName} ({opt.voteCount} phiếu)</Text>
                              <Text>{opt.percentage.toFixed(2)}%</Text>
                            </div>
                            <Progress percent={parseFloat(opt.percentage.toFixed(2))} status="active" strokeColor={
                              opt.votingOptionName === 'Đồng ý' ? '#52c41a' :
                                opt.votingOptionName === 'Không đồng ý' ? '#ff4d4f' : '#faad14'
                            } />
                            <Text type="secondary" style={{ fontSize: '12px' }}>Quyền biểu quyết: {opt.totalWeight.toLocaleString()}</Text>
                          </div>
                        ))}
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* Elections Section */}
            {realtimeStatus.electionResults && realtimeStatus.electionResults.length > 0 && (
              <Card title={<Space><TeamOutlined /> Kết quả Bầu cử</Space>} className={styles.statsCard}>
                <List
                  grid={{ gutter: 16, column: 1 }}
                  dataSource={realtimeStatus.electionResults}
                  renderItem={(ele) => (
                    <List.Item>
                      <Card type="inner" title={ele.electionTitle} size="small">
                        <div style={{ marginBottom: '16px' }}>
                          <Text strong>Tổng số phiếu: {ele.totalVoters}</Text> | <Text strong>Tổng quyền biểu quyết: {ele.totalWeight.toLocaleString()}</Text>
                        </div>
                        <div style={{ marginTop: '16px' }}>
                          {ele.results && ele.results.map((cand) => (
                            <div key={cand.votingOptionId} style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <Text>{cand.votingOptionName} ({cand.voteCount} phiếu)</Text>
                                <Text>{cand.percentage.toFixed(2)}%</Text>
                              </div>
                              <Progress percent={parseFloat(cand.percentage.toFixed(2))} />
                              <Text type="secondary" style={{ fontSize: '12px' }}>Quyền biểu quyết: {cand.totalWeight.toLocaleString()}</Text>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Space>
        )}
      </div>

      <AddShareholderModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); }}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
