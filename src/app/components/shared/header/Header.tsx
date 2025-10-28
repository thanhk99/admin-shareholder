'use client';

import { useState } from 'react';
import Notification from '../../Notification/Notification';
import styles from './Header.module.css';
import { adminInfo } from '@/app/types/admin';
import TokenService from '@/lib/api/token';
import { useAuth } from '@/lib/context/AuthProvider';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: adminInfo | null;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  currentPage: string; 
}

export default function Header({ user, onToggleSidebar, isSidebarOpen, currentPage }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { refreshUser} =useAuth();
    const handleLogout = async () => {
        try {
            TokenService.clearToken();
            
            await refreshUser();
            
            // Chuyển hướng về trang login
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.sidebarToggle}
          onClick={onToggleSidebar}
          aria-label={isSidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
        >
          <span className={styles.hamburger}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
        
        <div className={styles.breadcrumb}>
          <span className={styles.appName}>Admin Panel</span>
          <span className={styles.separator}>/</span>
          <span className={styles.currentPage}>{currentPage}</span>
        </div>
      </div>

      <div className={styles.headerRight}>
        <div className={styles.headerActions}>
          <Notification />

          <div className={styles.userMenu}>
            <button 
              className={styles.userButton}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name}</span>
                <span className={styles.userRole}>{user?.superAdmin}</span>
              </div>
              <div className={styles.userAvatar}>
                <div className={styles.avatarPlaceholder}>
                {user?.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className={`${styles.chevron} ${showUserMenu ? styles.rotated : ''}`}
              >
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </button>

            {showUserMenu && (
              <div className={styles.dropdownMenu}>
                <button className={styles.menuItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Hồ sơ
                </button>
                <button className={styles.menuItem}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                  </svg>
                  Cài đặt
                </button>
                <div className={styles.menuDivider}></div>
                <button className={styles.menuItem} onClick={handleLogout}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for dropdown */}
      {showUserMenu && (
        <div 
          className={styles.overlay}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}