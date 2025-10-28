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
  const {admin} = useAuth()

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Get current page title for breadcrumb
  const getCurrentPageTitle = () => {
    const routes: { [key: string]: string } = {
      '/': 'Dashboard',
      '/shareholders': 'Quản lý Cổ đông',
      '/meetings': 'Quản lý Cuộc họp',
      '/voting': 'Quản lý Bầu cử',
      '/reports': 'Báo cáo',
      '/settings': 'Cài đặt',
    };
    
    // Match dynamic routes
    if (pathname.startsWith('/shareholders')) return 'Quản lý Cổ đông';
    if (pathname.startsWith('/meetings')) return 'Quản lý Cuộc họp';
    if (pathname.startsWith('/voting')) return 'Quản lý Bầu cử';
    
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