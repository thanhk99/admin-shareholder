import { useNotification } from '../../lib/context/NotificationContext';

export function useNotify() {
  const { addNotification } = useNotification();

  const success = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({ type: 'success', title, message, action });
  };

  const error = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({ type: 'error', title, message, action });
  };

  const warning = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({ type: 'warning', title, message, action });
  };

  const info = (title: string, message: string, action?: { label: string; onClick: () => void }) => {
    addNotification({ type: 'info', title, message, action });
  };

  return { success, error, warning, info };
}