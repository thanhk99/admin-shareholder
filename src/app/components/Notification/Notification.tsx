'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BellOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  DeleteOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useNotification } from "@/lib/context/NotificationContext"
import styles from './Notification.module.css';

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotification();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined className={styles.successIcon} />;
      case 'error':
        return <CloseCircleOutlined className={styles.errorIcon} />;
      case 'warning':
        return <ExclamationCircleOutlined className={styles.warningIcon} />;
      case 'info':
      default:
        return <InfoCircleOutlined className={styles.infoIcon} />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleActionClick = (e: React.MouseEvent, notificationId: string, action?: () => void) => {
    e.stopPropagation();
    markAsRead(notificationId);
    action?.();
  };

  return (
    <div className={styles.notificationContainer} ref={dropdownRef}>
      <button 
        className={styles.notificationButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Thông báo"
      >
        <BellOutlined />
        {state.unreadCount > 0 && (
          <span className={styles.notificationBadge}>
            {state.unreadCount > 99 ? '99+' : state.unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.notificationDropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Thông báo</h3>
            <div className={styles.headerActions}>
              {state.unreadCount > 0 && (
                <button 
                  className={styles.markAllButton}
                  onClick={markAllAsRead}
                  title="Đánh dấu tất cả đã đọc"
                >
                  <CheckOutlined />
                </button>
              )}
              {state.notifications.length > 0 && (
                <button 
                  className={styles.clearAllButton}
                  onClick={clearAll}
                  title="Xóa tất cả"
                >
                  <DeleteOutlined />
                </button>
              )}
              <button 
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                title="Đóng"
              >
                <CloseOutlined />
              </button>
            </div>
          </div>

          <div className={styles.notificationList}>
            {state.notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <BellOutlined />
                <p>Không có thông báo</p>
              </div>
            ) : (
              state.notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationItem} ${
                    !notification.read ? styles.unread : ''
                  } ${styles[notification.type]}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className={styles.notificationIcon}>
                    {getIcon(notification.type)}
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h4 className={styles.notificationTitle}>{notification.title}</h4>
                      <button
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                        title="Xóa thông báo"
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    <div className={styles.notificationFooter}>
                      <span className={styles.notificationTime}>
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.action && (
                        <button
                          className={styles.actionButton}
                          onClick={(e) => handleActionClick(e, notification.id, notification.action?.onClick)}
                        >
                          {notification.action.label}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {state.notifications.length > 10 && (
            <div className={styles.dropdownFooter}>
              <button className={styles.viewAllButton}>
                Xem tất cả thông báo ({state.notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}