'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  BankOutlined,
  CopyrightOutlined,
  IdcardOutlined,
  UnorderedListOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { MenuItem } from '@/app/types/types';
import { adminInfo } from '@/app/types/admin';
import { tokenManager } from '@/utils/tokenManager';
import Notification from '../../Notification/Notification';
import styles from './Sidebar.module.css';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthProvider';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user: adminInfo | null;
  currentPage: string;
}

export default function Sidebar({ isOpen, onToggle, user, currentPage }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      href: '/',
    },
    {
      id: 'users',
      label: 'Quản lý Người dùng',
      icon: <TeamOutlined />,
      href: '/users',
    },
    {
      id: 'meetings',
      label: 'Cuộc họp',
      icon: <CalendarOutlined />,
      href: '/meetings',
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <BarChartOutlined />,
      href: '/reports',
    },
    {
      id: 'proxy',
      label: 'Uỷ quyền',
      icon: <CheckCircleOutlined />,
      href: '/proxy',
    },
    {
      id: 'eligibility-check',
      label: 'Kiểm tra tư cách',
      icon: <IdcardOutlined />,
      href: '/eligibility-check',
    },
    {
      id: 'attendance-list',
      label: 'Danh sách tham dự',
      icon: <UnorderedListOutlined />,
      href: '/attendance-list',
    }
  ];

  const handleLogout = async () => {
    try {
      tokenManager.clearTokens();
      await refreshUser();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.sidebarHeader}>
          {isOpen ? (
            <div className={styles.headerTop}>
              <div className={styles.logoInfo}>
                <div className={styles.currentPageTitle}>{currentPage}</div>
                <div className={styles.adminPanelText}>Admin Panel</div>
              </div>
              <div className={styles.headerActions}>
                <Notification />
                <button className={styles.toggleBtn} onClick={onToggle} tabIndex={-1}>
                  <MenuFoldOutlined />
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.logoCollapsed}>
              <button className={styles.toggleBtnCollapsed} onClick={onToggle} tabIndex={-1}>
                <MenuUnfoldOutlined />
              </button>
            </div>
          )}
        </div>

        {isOpen && user && (
          <div className={styles.userSection}>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.fullName}</div>
              <button className={styles.logoutBtn} onClick={handleLogout} title="Đăng xuất" tabIndex={-1}>
                <LogoutOutlined />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.sectionLabel}>MAIN MENU</div>
            <ul className={styles.navList}>
              {menuItems.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''
                      }`}
                    title={!isOpen ? item.label : undefined}
                    tabIndex={-1}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    {isOpen && (
                      <span className={styles.navLabel}>{item.label}</span>
                    )}
                    {isActive(item.href) && (
                      <div className={styles.activeIndicator}></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          {isOpen ? (
            <div className={styles.footerContent}>
              <div className={styles.copyrightInfo}>
                <div className={styles.copyrightIcon}>
                  <CopyrightOutlined />
                </div>
                <div className={styles.copyrightText}>
                  <div className={styles.copyrightTitle}>Copyright</div>
                  <div className={styles.copyrightSubtitle}>Phạm Như Thành</div>
                </div>
              </div>
              <div className={styles.copyrightPeriod}>
                Tháng 9/2025 - 11/2025
              </div>
            </div>
          ) : (
            <div className={styles.footerCollapsed}>
              <button className={styles.copyrightButton} title="Bản quyền" tabIndex={-1}>
                <CopyrightOutlined />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onToggle}
        />
      )}
    </>
  );
}
