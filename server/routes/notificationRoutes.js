const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAsUnread,
  toggleImportant,
  deleteNotification,
  markAllAsRead,
  deleteMultiple,
  createNotification,
  getNotificationsAdmin,
  getNotificationsStatsAdmin,
  createNotificationAdmin,
  deleteNotificationAdmin,
  deleteMultipleAdmin,
  getChefsForAdmin
} = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Routes pour les chefs de classe
router.get('/', auth, getNotifications);
router.put('/:id/read', auth, markAsRead);
router.put('/:id/unread', auth, markAsUnread);
router.put('/:id/important', auth, toggleImportant);
router.delete('/:id', auth, deleteNotification);
router.put('/mark-all-read', auth, markAllAsRead);
router.delete('/', auth, deleteMultiple);

// Routes spécifiques pour les admins (DOIVENT être AVANT les routes génériques)
router.get('/admin/stats', auth, getNotificationsStatsAdmin);
router.get('/admin', auth, getNotificationsAdmin);
router.post('/admin/create', auth, createNotificationAdmin);
router.delete('/admin/bulk', auth, deleteMultipleAdmin);
router.delete('/admin/:id', auth, deleteNotificationAdmin);

// Routes pour créer des notifications (admins et système)
router.post('/', auth, createNotification);

module.exports = router; 