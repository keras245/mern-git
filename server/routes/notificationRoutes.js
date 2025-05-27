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
  createNotification
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

// Routes pour les admins
router.post('/', auth, createNotification);

module.exports = router; 