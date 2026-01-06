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
  CopyrightOutlined
} from '@ant-design/icons';
import { MenuItem } from '@/app/types/types';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardOutlined />,
      href: '/', 
    },
    {
      id: 'shareholders',
      label: 'Quản lý Cổ đông',
      icon: <TeamOutlined />,
      href: '/shareholders',
    },
    {
      id: 'meetings',
      label: 'Cuộc họp',
      icon: <CalendarOutlined />,
      href: '/meetings',
    },
    {
      id: 'election',
      label: 'Bầu cử',
      icon: <CheckCircleOutlined />,
      href: '/election',
    },
    {
      id: 'voting',
      label: 'Biểu quyết',
      icon: <CheckCircleOutlined />,
      href: '/voting',
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <BarChartOutlined />,
      href: '/reports',
    },
  ];

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
          {isOpen && (
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <BankOutlined />
              </div>
              <div className={styles.logoText}>
                <div className={styles.logoTitle}>VIX DHCD</div>
                <div className={styles.logoSubtitle}>Admin Panel</div>
              </div>
            </div>
          )}
          {!isOpen && (
            <div className={styles.logoCollapsed}>
              <div className={styles.logoIcon}>
                <BankOutlined />
              </div>
            </div>
          )}
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.sectionLabel}>MAIN MENU</div>
            <ul className={styles.navList}>
              {menuItems.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${
                      isActive(item.href) ? styles.active : ''
                    }`}
                    title={!isOpen ? item.label : undefined}
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
              <button className={styles.copyrightButton} title="Bản quyền">
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