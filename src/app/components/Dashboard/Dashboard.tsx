'use client';

import { useEffect, useState } from 'react';
import styles from './Dashboard.module.css';
import { useRealtime } from '@/lib/context/RealtimeContext';
import { Progress, Card, List, Typography, Space, Row, Col, Statistic, Spin } from 'antd';
import { CheckCircleOutlined, TeamOutlined, BarChartOutlined, UserOutlined, PieChartOutlined } from '@ant-design/icons';
import AddShareholderModal from '../UserManagement/AddShareholderModal/AddShareholderModal';
import { DashboardService } from '@/lib/api/dashboard';
import { DashboardStatsResponse } from '@/app/types/dashboard';

const { Title, Text } = Typography;

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [summary, setSummary] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { realtimeStatus, isConnected } = useRealtime();

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      try {
        const data = await DashboardService.getSummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard summary:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSummary();
    // Refresh summary every 30 seconds
    const interval = setInterval(fetchSummary, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><Spin size="large" /></div>
        ) : (
          <>
            {summary && (
              <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={24} sm={12} lg={4}>
                  <Card className={styles.statMiniCard}>
                    <Statistic
                      title="Tổng số cổ đông"
                      value={summary.userStats.totalShareholders}
                      prefix={<TeamOutlined />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <Card className={styles.statMiniCard}>
                    <Statistic
                      title="Tổng số cổ phần"
                      value={summary.userStats.totalSharesRepresented}
                      formatter={(value) => value.toLocaleString()}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <Card className={styles.statMiniCard}>
                    <Statistic
                      title="Tham dự (Người)"
                      value={summary.userStats.attendedCount}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <Card className={styles.statMiniCard}>
                    <Statistic
                      title="Tham dự (Cổ phần)"
                      value={summary.userStats.attendedShares}
                      formatter={(value) => value.toLocaleString()}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <Card className={styles.statMiniCard}>
                    <Statistic
                      title="Tỷ lệ tham dự"
                      value={summary.userStats.participationRate}
                      precision={2}
                      suffix="%"
                      prefix={<PieChartOutlined />}
                      valueStyle={{ color: summary.userStats.participationRate >= 50 ? '#52c41a' : '#faad14' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {!realtimeStatus ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '8px' }}>
                <Text type="secondary">Chưa có dữ liệu biểu quyết realtime...</Text>
              </div>
            ) : (
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Global Legend */}
                <Card size="small" className={styles.compactInnerCard} style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: '#52c41a', width: '12px', height: '12px' }} />
                      <Text strong style={{ fontSize: '13px' }}>Đồng ý</Text>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: '#ff4d4f', width: '12px', height: '12px' }} />
                      <Text strong style={{ fontSize: '13px' }}>Không đồng ý</Text>
                    </div>
                    <div className={styles.legendItem}>
                      <div className={styles.legendColor} style={{ backgroundColor: '#faad14', width: '12px', height: '12px' }} />
                      <Text strong style={{ fontSize: '13px' }}>Không ý kiến / Khác</Text>
                    </div>
                  </div>
                </Card>
                {/* Resolutions Section */}
                {realtimeStatus.resolutionResults && realtimeStatus.resolutionResults.length > 0 && (
                  <Card title={<Space><BarChartOutlined /> Kết quả Biểu quyết</Space>} className={styles.statsCard}>
                    <List
                      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
                      dataSource={realtimeStatus.resolutionResults}
                      renderItem={(res: any) => (
                        <List.Item>
                          <Card
                            className={styles.compactInnerCard}
                            title={res.resolutionTitle}
                            size="small"
                          >
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              <Text strong style={{ fontSize: '12px' }}>{res.totalVoters} phiếu</Text>
                              <span style={{ margin: '0 4px' }}>|</span>
                              <span>Quyền: {res.totalWeight.toLocaleString()}</span>
                            </div>

                            <div className={styles.stackedBarContainer}>
                              <div className={styles.stackedBar}>
                                {res.results.map((opt: any) => {
                                  const color = opt.votingOptionName === 'Đồng ý' ? '#52c41a' :
                                    opt.votingOptionName === 'Không đồng ý' ? '#ff4d4f' : '#faad14';
                                  return (
                                    <div
                                      key={opt.votingOptionId}
                                      className={styles.barSegment}
                                      style={{
                                        width: `${opt.percentage}%`,
                                        backgroundColor: color
                                      }}
                                    />
                                  );
                                })}
                              </div>
                              <div className={styles.legendContainer}>
                                {res.results.map((opt: any) => {
                                  const color = opt.votingOptionName === 'Đồng ý' ? '#52c41a' :
                                    opt.votingOptionName === 'Không đồng ý' ? '#ff4d4f' : '#faad14';
                                  return (
                                    <div key={opt.votingOptionId} className={styles.legendItem}>
                                      <div className={styles.legendColor} style={{ backgroundColor: color }} />
                                      <Text style={{ fontSize: '11px' }}>
                                        {opt.votingOptionName.charAt(0)}: {opt.percentage.toFixed(1)}%
                                      </Text>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
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
                      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
                      dataSource={realtimeStatus.electionResults}
                      renderItem={(ele: any) => (
                        <List.Item>
                          <Card
                            className={styles.compactInnerCard}
                            title={ele.electionTitle}
                            size="small"
                          >
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                              <Text strong style={{ fontSize: '12px' }}>{ele.totalVoters} phiếu</Text>
                              <span style={{ margin: '0 4px' }}>|</span>
                              <span>Quyền: {ele.totalWeight.toLocaleString()}</span>
                            </div>
                            {ele.results && ele.results.map((cand: any) => (
                              <div key={cand.votingOptionId} style={{ marginBottom: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                  <Text style={{ fontSize: '11px' }}>{cand.votingOptionName}</Text>
                                  <Text style={{ fontSize: '11px' }} strong>{cand.percentage.toFixed(1)}%</Text>
                                </div>
                                <Progress
                                  percent={parseFloat(cand.percentage.toFixed(1))}
                                  size="small"
                                  strokeLinecap="butt"
                                  showInfo={false}
                                  strokeWidth={6}
                                />
                              </div>
                            ))}
                          </Card>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </Space>
            )}
          </>
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
