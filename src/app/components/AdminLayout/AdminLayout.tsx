'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '../shared/header/Header';
import Sidebar from '../shared/sidebar/Sidebar';
import styles from './AdminLayout.module.css';
import { useAuth } from '@/lib/context/AuthProvider';

interface AdminLayoutProps {
  children: React.ReactNode;
}


export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { admin } = useAuth()

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get current page title for breadcrumb
  const getCurrentPageTitle = () => {
    const routes: { [key: string]: string } = {
      '/': 'Dashboard',
      '/users': 'Quản lý Người dùng',
      '/meetings': 'Quản lý Cuộc họp',
      '/reports': 'Báo cáo',
    };

    // Match dynamic routes
    if (pathname.startsWith('/users')) return 'Quản lý Người dùng';
    if (pathname.startsWith('/meetings')) return 'Quản lý Cuộc họp';
    if (pathname.startsWith('/resolution')) return 'Quản lý Biểu quyết';
    if (pathname.startsWith('/candidate')) return 'Quản lý Ứng viên';
    if (pathname.startsWith('/reports')) return 'Báo cáo';

    return routes[pathname] || 'Dashboard';
  };

  return (
    <div className={styles.adminLayout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={handleToggleSidebar}
      />

      <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
        <Header
          user={admin}
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          currentPage={getCurrentPageTitle()}
        />

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}