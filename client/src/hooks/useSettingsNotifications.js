import { useState, useCallback } from 'react';

export const useSettingsNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      autoHide: true,
      duration: 4000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message, title = null, actions = null) => {
    return addNotification({
      type: 'success',
      message,
      title,
      actions
    });
  }, [addNotification]);

  const showError = useCallback((message, title = null, actions = null) => {
    return addNotification({
      type: 'error',
      message,
      title,
      actions,
      autoHide: false // Les erreurs ne se cachent pas automatiquement
    });
  }, [addNotification]);

  const showWarning = useCallback((message, title = null, actions = null) => {
    return addNotification({
      type: 'warning',
      message,
      title,
      actions,
      duration: 6000 // Plus long pour les avertissements
    });
  }, [addNotification]);

  const showInfo = useCallback((message, title = null, actions = null) => {
    return addNotification({
      type: 'info',
      message,
      title,
      actions
    });
  }, [addNotification]);

  const showSettings = useCallback((message, title = null, actions = null) => {
    return addNotification({
      type: 'settings',
      message,
      title,
      actions
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSettings
  };
};

export default useSettingsNotifications; 