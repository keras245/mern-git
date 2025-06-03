const Session = require('../models/Session');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

// Obtenir les sessions actives de l'utilisateur
exports.getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.token;

    const activeSessions = await Session.find({
      userId,
      isActive: true
    }).sort({ lastActivity: -1 });

    const sessionsWithDetails = activeSessions.map(session => {
      const parser = new UAParser(session.deviceInfo.userAgent || '');
      const browserInfo = parser.getBrowser();
      const osInfo = parser.getOS();
      const deviceInfo = parser.getDevice();

      return {
        id: session._id,
        deviceType: deviceInfo.type || 'desktop',
        browser: `${browserInfo.name || 'Inconnu'} ${browserInfo.version || ''}`.trim(),
        os: `${osInfo.name || 'Inconnu'} ${osInfo.version || ''}`.trim(),
        location: `${session.location.city || 'Ville inconnue'}, ${session.location.country || 'Pays inconnu'}`,
        ip: session.location.ip,
        lastActivity: session.lastActivity,
        loginTime: session.loginTime,
        current: session.token === currentToken
      };
    });

    res.json({
      success: true,
      sessions: sessionsWithDetails
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions actives:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions actives'
    });
  }
};

// Obtenir l'historique des connexions
exports.getSessionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sessionHistory = await Session.find({
      userId,
      loginTime: { $gte: startDate }
    })
    .sort({ loginTime: -1 })
    .limit(parseInt(limit));

    const historyWithDetails = sessionHistory.map(session => {
      const parser = new UAParser(session.deviceInfo.userAgent || '');
      const browserInfo = parser.getBrowser();
      const osInfo = parser.getOS();

      return {
        id: session._id,
        timestamp: session.loginTime,
        ip: session.location.ip,
        location: `${session.location.city || 'Ville inconnue'}, ${session.location.country || 'Pays inconnu'}`,
        device: `${browserInfo.name || 'Navigateur inconnu'} sur ${osInfo.name || 'OS inconnu'}`,
        success: true, // Toutes les sessions dans la base sont des connexions réussies
        duration: session.logoutTime ? 
          Math.round((new Date(session.logoutTime) - new Date(session.loginTime)) / 60000) : null,
        isActive: session.isActive
      };
    });

    res.json({
      success: true,
      history: historyWithDetails
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique'
    });
  }
};

// Terminer une session spécifique
exports.terminateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const currentToken = req.token;

    const session = await Session.findOne({
      _id: sessionId,
      userId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Empêcher la suppression de la session actuelle
    if (session.token === currentToken) {
      return res.status(400).json({
        success: false,
        message: 'Impossible de terminer la session actuelle'
      });
    }

    await session.terminate();

    res.json({
      success: true,
      message: 'Session terminée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la terminaison de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la terminaison de la session'
    });
  }
};

// Terminer toutes les autres sessions
exports.terminateAllOtherSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentToken = req.token;

    const result = await Session.updateMany(
      {
        userId,
        isActive: true,
        token: { $ne: currentToken }
      },
      {
        $set: {
          isActive: false,
          logoutTime: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} session(s) terminée(s)`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Erreur lors de la terminaison des sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la terminaison des sessions'
    });
  }
};

// Mettre à jour l'activité de la session actuelle
exports.updateActivity = async (req, res) => {
  try {
    const currentToken = req.token;

    const session = await Session.findOne({
      token: currentToken,
      isActive: true
    });

    if (session) {
      await session.updateActivity();
    }

    res.json({
      success: true,
      message: 'Activité mise à jour'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'activité:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'activité'
    });
  }
};

// Fonction utilitaire pour créer une session lors de la connexion
exports.createSession = async (userId, userType, token, req) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';
    
    // Obtenir les informations de géolocalisation
    const geo = geoip.lookup(ip) || {};
    
    // Parser les informations du navigateur
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    // Calculer l'expiration de la session (24h par défaut)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = new Session({
      userId,
      userType,
      token,
      deviceInfo: {
        browser: browser.name || 'Inconnu',
        os: os.name || 'Inconnu',
        device: device.model || device.type || 'Inconnu',
        userAgent
      },
      location: {
        ip,
        country: geo.country || 'Inconnu',
        city: geo.city || 'Inconnu',
        region: geo.region || 'Inconnu'
      },
      expiresAt
    });

    await session.save();
    return session;
  } catch (error) {
    console.error('Erreur lors de la création de la session:', error);
    throw error;
  }
}; 