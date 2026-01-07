'use client';

import { useState, useEffect } from 'react';
import {
  TeamOutlined,
  CalendarOutlined,
  CheckSquareOutlined,
  PieChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ScheduleOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import styles from './Dashboard.module.css';
import AddShareholderModal from '../UserManagement/AddShareholderModal/AddShareholderModal';
import { DashboardService } from '@/lib/api/dashboard';
import { useAuth } from '@/lib/context/AuthProvider';
import { DashboardStatsResponse } from '@/app/types/dashboard';
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  GlobalOutlined
} from '@ant-design/icons';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { admin } = useAuth();

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await DashboardService.getSummary();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subValue
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subValue?: string;
  }) => (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className={styles.statContent}>
        <h3 className={styles.statValue}>{value}</h3>
        <p className={styles.statTitle}>{title}</p>
        {subValue && <span className={styles.subValue}>{subValue}</span>}
      </div>
    </div>
  );

  const handleAddShareholder = () => {
    setShowAddModal(true);
  };

  const handleAddSuccess = async () => {
    await fetchDashboardStats();
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Tổng quan hệ thống quản lý cổ đông</p>
      </div>

      {admin && (
        <div className={styles.adminProfileSection}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {admin.fullName?.split(' ').map(n => n[0]).join('')}
            </div>
            <div className={styles.profileBaseInfo}>
              <h2>{admin.fullName}</h2>
              <span className={styles.adminBadge}>Administrator</span>
              <p className={styles.username}>@{admin.username}</p>
            </div>
          </div>

          <div className={styles.profileDetailsGrid}>
            <div className={styles.detailItem}>
              <MailOutlined />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{admin.email}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <IdcardOutlined />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Mã nhà đầu tư / CCCD</span>
                <span className={styles.detailValue}>{admin.investorCode} / {admin.cccd}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <PhoneOutlined />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Số điện thoại</span>
                <span className={styles.detailValue}>{admin.phoneNumber}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <SafetyCertificateOutlined />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Cổ phần sở hữu</span>
                <span className={styles.detailValue}>{formatNumber(admin.sharesOwned)} CP</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <GlobalOutlined />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Địa chỉ</span>
                <span className={styles.detailValue}>{admin.address}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <CalendarOutlined />
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>Ngày tham gia</span>
                <span className={styles.detailValue}>{new Date(admin.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Tổng Người dùng"
          value={stats ? formatNumber(stats.userStats.totalShareholders) : '...'}
          icon={<TeamOutlined />}
          color="#3498db"
        />
        <StatCard
          title="Tổng Cổ phần Đại diện"
          value={stats ? formatNumber(stats.userStats.totalSharesRepresented) : '...'}
          icon={<PieChartOutlined />}
          color="#f39c12"
        />
        <StatCard
          title="Tổng Cuộc họp"
          value={stats ? formatNumber(stats.meetingStats.totalMeetings) : '...'}
          icon={<CalendarOutlined />}
          color="#9b59b6"
        />
      </div>

      {/* Meeting Status Grid */}
      <h2 className={styles.sectionTitle}>Trạng thái Cuộc họp</h2>
      <div className={styles.statsGrid}>
        <StatCard
          title="Sắp diễn ra"
          value={stats ? stats.meetingStats.scheduled : 0}
          icon={<ScheduleOutlined />}
          color="#3498db"
        />
        <StatCard
          title="Đang diễn ra"
          value={stats ? stats.meetingStats.ongoing : 0}
          icon={<SyncOutlined spin />}
          color="#e67e22"
        />
        <StatCard
          title="Đã kết thúc"
          value={stats ? stats.meetingStats.completed : 0}
          icon={<CheckCircleOutlined />}
          color="#27ae60"
        />
        <StatCard
          title="Đã hủy"
          value={stats ? stats.meetingStats.cancelled : 0}
          icon={<CloseCircleOutlined />}
          color="#c0392b"
        />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.quickActions}>
          <div className={styles.sectionHeader}>
            <h2>Thao tác nhanh</h2>
          </div>
          <div className={styles.actionsGrid}>
            <button className={styles.actionButton} onClick={handleAddShareholder}>
              <TeamOutlined />
              <span>Thêm người dùng</span>
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
      <AddShareholderModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); }}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}