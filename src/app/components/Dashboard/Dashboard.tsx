'use client';

import { useState, useEffect } from 'react';
import { 
  TeamOutlined, 
  CalendarOutlined, 
  CheckSquareOutlined, 
  PieChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import styles from './Dashboard.module.css';

interface DashboardStats {
  totalShareholders: number;
  totalMeetings: number;
  activeVotings: number;
  totalShares: number;
  shareholderGrowth: number;
  meetingGrowth: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalShareholders: 0,
    totalMeetings: 0,
    activeVotings: 0,
    totalShares: 0,
    shareholderGrowth: 0,
    meetingGrowth: 0,
  });

  useEffect(() => {
    // Mock data - thay thế bằng API call thực tế
    setStats({
      totalShareholders: 156,
      totalMeetings: 12,
      activeVotings: 3,
      totalShares: 125000,
      shareholderGrowth: 12.5,
      meetingGrowth: -2.3,
    });
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    growth 
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode;
    color: string; 
    growth?: number;
  }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statValue}>{value.toLocaleString()}</h3>
        <p className={styles.statTitle}>{title}</p>
        {growth !== undefined && (
          <div className={`${styles.growth} ${growth >= 0 ? styles.positive : styles.negative}`}>
            {growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(growth)}%
          </div>
        )}
      </div>
    </div>
  );

  const recentActivities = [
    {
      id: 1,
      type: 'shareholder',
      message: 'Cổ đông mới Nguyễn Văn A đã đăng ký',
      time: '2 giờ trước',
      icon: <TeamOutlined />
    },
    {
      id: 2,
      type: 'meeting',
      message: 'Cuộc họp ĐHCĐ thường niên đã được lên lịch',
      time: '1 ngày trước',
      icon: <CalendarOutlined />
    },
    {
      id: 3,
      type: 'voting',
      message: 'Phiên bầu cử Chủ tịch HĐQT đã bắt đầu',
      time: '3 ngày trước',
      icon: <CheckSquareOutlined />
    },
    {
      id: 4,
      type: 'shareholder',
      message: 'Cập nhật thông tin cổ đông Trần Thị B',
      time: '5 ngày trước',
      icon: <TeamOutlined />
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống quản lý cổ đông</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          title="Tổng Cổ đông"
          value={stats.totalShareholders}
          icon={<TeamOutlined />}
          color="#3498db"
          growth={stats.shareholderGrowth}
        />
        <StatCard
          title="Cuộc họp"
          value={stats.totalMeetings}
          icon={<CalendarOutlined />}
          color="#e74c3c"
          growth={stats.meetingGrowth}
        />
        <StatCard
          title="Bầu cử đang diễn ra"
          value={stats.activeVotings}
          icon={<CheckSquareOutlined />}
          color="#2ecc71"
        />
        <StatCard
          title="Tổng Cổ phần"
          value={stats.totalShares}
          icon={<PieChartOutlined />}
          color="#f39c12"
        />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.recentActivity}>
          <div className={styles.sectionHeader}>
            <h2>Hoạt động gần đây</h2>
            <button className={styles.viewAllButton}>Xem tất cả</button>
          </div>
          <div className={styles.activityList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  {activity.icon}
                </div>
                <div className={styles.activityContent}>
                  <p className={styles.activityMessage}>{activity.message}</p>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.quickActions}>
          <div className={styles.sectionHeader}>
            <h2>Thao tác nhanh</h2>
          </div>
          <div className={styles.actionsGrid}>
            <button className={styles.actionButton}>
              <TeamOutlined />
              <span>Thêm cổ đông</span>
            </button>
            <button className={styles.actionButton}>
              <CalendarOutlined />
              <span>Tạo cuộc họp</span>
            </button>
            <button className={styles.actionButton}>
              <CheckSquareOutlined />
              <span>Bắt đầu bầu cử</span>
            </button>
            <button className={styles.actionButton}>
              <PieChartOutlined />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}