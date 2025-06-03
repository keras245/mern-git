const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

// Routes pour les sessions
router.get('/active', auth, sessionController.getActiveSessions);
router.get('/history', auth, sessionController.getSessionHistory);
router.delete('/:sessionId', auth, sessionController.terminateSession);
router.delete('/others/all', auth, sessionController.terminateAllOtherSessions);
router.patch('/activity', auth, sessionController.updateActivity);

module.exports = router; 