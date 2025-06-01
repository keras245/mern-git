import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      let count = 0;
      
      if (response.data.stats) {
        count = response.data.stats.unread || 0;
      } else if (Array.isArray(response.data)) {
        count = response.data.filter(n => !n.read).length;
      }
      
      setUnreadCount(count);
    } catch (error) {
      console.error('Erreur chargement notifications count:', error);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fonctions pour mettre à jour le count instantanément
  const markAsRead = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAsUnread = useCallback(() => {
    setUnreadCount(prev => prev + 1);
  }, []);

  const deleteNotification = useCallback((wasUnread) => {
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const deleteMultiple = useCallback((unreadCount) => {
    setUnreadCount(prev => Math.max(0, prev - unreadCount));
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const refresh = useCallback(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    markAsRead,
    markAsUnread,
    deleteNotification,
    deleteMultiple,
    markAllAsRead,
    refresh
  };
}; 