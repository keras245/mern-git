import { createContext, useContext } from 'react';
import { useNotificationCount } from '../hooks/useNotificationCount';

const NotificationCountContext = createContext();

export const NotificationCountProvider = ({ children }) => {
  const notificationCount = useNotificationCount();

  return (
    <NotificationCountContext.Provider value={notificationCount}>
      {children}
    </NotificationCountContext.Provider>
  );
};

export const useNotificationCountContext = () => {
  const context = useContext(NotificationCountContext);
  if (!context) {
    throw new Error('useNotificationCountContext must be used within NotificationCountProvider');
  }
  return context;
}; 