'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  BankOutlined
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
      id: 'voting',
      label: 'Bầu cử',
      icon: <CheckCircleOutlined />,
      href: '/voting',
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <BarChartOutlined />,
      href: '/reports',
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: <SettingOutlined />,
      href: '/settings',
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
                <div className={styles.logoTitle}>Công ty CP</div>
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
              <div className={styles.footerHelp}>
                <div className={styles.helpIcon}>
                  <QuestionCircleOutlined />
                </div>
                <div className={styles.helpText}>
                  <div className={styles.helpTitle}>Cần trợ giúp?</div>
                  <div className={styles.helpSubtitle}>Kiểm tra tài liệu</div>
                </div>
              </div>
              <button className={styles.footerButton}>
                <BookOutlined />
                Tài liệu
              </button>
            </div>
          ) : (
            <div className={styles.footerCollapsed}>
              <button className={styles.helpButton} title="Help">
                <QuestionCircleOutlined />
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