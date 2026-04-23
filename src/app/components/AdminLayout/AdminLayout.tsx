'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from '../shared/sidebar/Sidebar';
import styles from './AdminLayout.module.css';
import { useAuth } from '@/lib/context/AuthProvider';
import { RealtimeProvider } from '@/lib/context/RealtimeContext';
import { Spin } from 'antd';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { admin, loading } = useAuth();

  useEffect(() => {
    if (!loading && !admin) {
      router.push('/login');
    }
  }, [admin, loading, router]);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get current page title for breadcrumb
  const getCurrentPageTitle = () => {
    const routes: { [key: string]: string } = {
      '/': 'Dashboard',
      '/users': 'Quản lý Người dùng',
      '/proxy': 'Quản lý uỷ quyền',
      '/meetings': 'Quản lý Cuộc họp',
      '/reports': 'Báo cáo',
      '/eligibility-check': 'Kiểm tra tư cách cổ đông',
      '/attendance-list': 'Danh sách người tham dự'
    };

    // Match dynamic routes
    if (pathname.startsWith('/users')) return 'Quản lý Người dùng';
    if (pathname.startsWith('/meetings')) return 'Quản lý Cuộc họp';
    if (pathname.startsWith('/resolution')) return 'Quản lý Biểu quyết';
    if (pathname.startsWith('/candidate')) return 'Quản lý Ứng viên';
    if (pathname.startsWith('/reports')) return 'Báo cáo';
    if (pathname.startsWith('/proxy')) return 'Quản lý uỷ quyền';
    if (pathname.startsWith('/eligibility-check')) return 'Kiểm tra tư cách cổ đông';
    if (pathname.startsWith('/attendance-list')) return 'Danh sách người tham dự';

    return routes[pathname] || 'Dashboard';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect via useEffect
  }

  return (
    <RealtimeProvider>
      <div className={styles.adminLayout}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={handleToggleSidebar}
          user={admin}
          currentPage={getCurrentPageTitle()}
        />

        <div className={`${styles.mainContent} ${!isSidebarOpen ? styles.sidebarClosed : ''}`}>
          <div className={styles.content}>
            {children}
          </div>
        </div>
      </div>
    </RealtimeProvider>
  );
}
