const Notification = require('../models/Notification');
const ChefDeClasse = require('../models/ChefDeClasse');

// Obtenir toutes les notifications d'un chef
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const chefId = req.user.id;

    // Construction du filtre
    const filter = {
      $or: [
        { recipient: chefId },
        { recipient: 'all', recipientType: 'chef' }
      ],
      archived: false
    };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (status === 'read') {
      filter.read = true;
    } else if (status === 'unread') {
      filter.read = false;
    } else if (status === 'important') {
      filter.important = true;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(filter);

    // Statistiques
    const stats = {
      total: await Notification.countDocuments({
        $or: [
          { recipient: chefId },
          { recipient: 'all', recipientType: 'chef' }
        ],
        archived: false
      }),
      unread: await Notification.countDocuments({
        $or: [
          { recipient: chefId },
          { recipient: 'all', recipientType: 'chef' }
        ],
        read: false,
        archived: false
      }),
      important: await Notification.countDocuments({
        $or: [
          { recipient: chefId },
          { recipient: 'all', recipientType: 'chef' }
        ],
        important: true,
        archived: false
      }),
      today: await Notification.countDocuments({
        $or: [
          { recipient: chefId },
          { recipient: 'all', recipientType: 'chef' }
        ],
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        archived: false
      })
    };

    res.json({
      notifications,
      stats,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer une notification comme lue
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const chefId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      $or: [
        { recipient: chefId },
        { recipient: 'all', recipientType: 'chef' }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    await notification.markAsRead();
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors du marquage comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer une notification comme non lue
const markAsUnread = async (req, res) => {
  try {
    const { id } = req.params;
    const chefId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      $or: [
        { recipient: chefId },
        { recipient: 'all', recipientType: 'chef' }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    notification.read = false;
    await notification.save();
    res.json({ message: 'Notification marquée comme non lue' });
  } catch (error) {
    console.error('Erreur lors du marquage comme non lu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Basculer l'importance d'une notification
const toggleImportant = async (req, res) => {
  try {
    const { id } = req.params;
    const chefId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      $or: [
        { recipient: chefId },
        { recipient: 'all', recipientType: 'chef' }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    await notification.toggleImportant();
    res.json({ 
      message: notification.important ? 'Notification marquée comme importante' : 'Importance retirée',
      important: notification.important
    });
  } catch (error) {
    console.error('Erreur lors du basculement d\'importance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer une notification (archiver)
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const chefId = req.user.id;

    const notification = await Notification.findOne({
      _id: id,
      $or: [
        { recipient: chefId },
        { recipient: 'all', recipientType: 'chef' }
      ]
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    notification.archived = true;
    await notification.save();
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Marquer toutes les notifications comme lues
const markAllAsRead = async (req, res) => {
  try {
    const chefId = req.user.id;

    await Notification.updateMany(
      {
        $or: [
          { recipient: chefId },
          { recipient: 'all', recipientType: 'chef' }
        ],
        read: false,
        archived: false
      },
      { read: true }
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur lors du marquage global comme lu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer plusieurs notifications
const deleteMultiple = async (req, res) => {
  try {
    const { ids } = req.body;
    const chefId = req.user.id;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs de notifications requis' });
    }

    await Notification.updateMany(
      {
        _id: { $in: ids },
        $or: [
          { recipient: chefId },
          { recipient: 'all', recipientType: 'chef' }
        ]
      },
      { archived: true }
    );

    res.json({ message: `${ids.length} notification(s) supprimée(s)` });
  } catch (error) {
    console.error('Erreur lors de la suppression multiple:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer une notification (pour l'admin)
const createNotification = async (req, res) => {
  try {
    const { title, message, type, recipient, important, metadata } = req.body;
    const senderId = req.user.id;

    if (!title || !message) {
      return res.status(400).json({ message: 'Titre et message requis' });
    }

    const notificationData = {
      title,
      message,
      type: type || 'info',
      sender: senderId,
      senderType: 'admin',
      important: important || false,
      metadata: metadata || {}
    };

    let notifications;

    if (recipient === 'all') {
      // Envoyer à tous les chefs de classe
      notifications = await Notification.sendToAllChefs(notificationData);
    } else {
      // Envoyer à un chef spécifique
      notificationData.recipient = recipient;
      notificationData.recipientType = 'chef';
      notifications = await Notification.createNotification(notificationData);
    }

    res.status(201).json({ 
      message: 'Notification(s) créée(s) avec succès',
      notifications
    });
  } catch (error) {
    console.error('Erreur lors de la création de notification:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// ===== NOUVELLES FONCTIONS POUR L'ADMIN =====

// Récupérer toutes les notifications pour l'admin
const getNotificationsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status, recipient } = req.query;

    console.log('=== RÉCUPÉRATION NOTIFICATIONS ADMIN ===');
    console.log('Params:', { page, limit, type, status, recipient });

    // Construction du filtre
    const filter = { archived: false };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (status === 'read') {
      filter.read = true;
    } else if (status === 'unread') {
      filter.read = false;
    } else if (status === 'important') {
      filter.important = true;
    }

    if (recipient === 'all_recipients') {
      filter.recipientType = 'all';
    } else if (recipient === 'specific') {
      filter.recipientType = { $ne: 'all' };
    }

    const notifications = await Notification.find(filter)
      .populate('recipient', 'nom prenom classe') // Pour les destinataires spécifiques
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log(`Trouvé ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('Erreur récupération notifications admin:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Statistiques des notifications pour l'admin
const getNotificationsStatsAdmin = async (req, res) => {
  try {
    console.log('=== STATS NOTIFICATIONS ADMIN ===');

    const [total, unread, important, today] = await Promise.all([
      Notification.countDocuments({ archived: false }),
      Notification.countDocuments({ read: false, archived: false }),
      Notification.countDocuments({ important: true, archived: false }),
      Notification.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        },
        archived: false
      })
    ]);

    // Stats par type
    const byType = await Notification.aggregate([
      { $match: { archived: false } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Stats par destinataire
    const byRecipient = await Notification.aggregate([
      { $match: { archived: false } },
      {
        $group: {
          _id: '$recipientType',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total,
      unread,
      important,
      today,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byRecipient: byRecipient.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    console.log('Stats calculées:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Erreur stats notifications admin:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer une notification pour l'admin
const createNotificationAdmin = async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      important = false,
      recipient,
      recipientType
    } = req.body;

    console.log('=== CRÉATION NOTIFICATION ADMIN ===');
    console.log('Données reçues:', req.body);

    if (!title || !message) {
      return res.status(400).json({ 
        message: 'Le titre et le message sont requis' 
      });
    }

    const notificationData = {
      title: title.trim(),
      message: message.trim(),
      type,
      important,
      recipient: recipient || 'all',
      recipientType: recipientType || 'chef',
      sender: 'Administration',
      senderType: 'admin'
    };

    let result;

    if (recipient === 'all' || recipientType === 'all') {
      // Envoyer à tous les chefs de classe
      console.log('Envoi à tous les chefs de classe');
      const notifications = await Notification.sendToAllChefs(notificationData);
      console.log(`${notifications.length} notifications créées`);
      
      res.status(201).json({
        message: `Notification envoyée à ${notifications.length} chefs de classe`,
        count: notifications.length
      });
    } else {
      // Envoyer à un chef spécifique
      console.log('Envoi à un chef spécifique:', recipient);
      const notification = await Notification.createNotification(notificationData);
      console.log('Notification créée:', notification._id);
      
      res.status(201).json({
        message: 'Notification créée avec succès',
        notification
      });
    }
  } catch (error) {
    console.error('Erreur création notification admin:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la création de la notification',
      error: error.message 
    });
  }
};

// Supprimer une notification (admin)
const deleteNotificationAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== SUPPRESSION NOTIFICATION ADMIN ===');
    console.log('ID:', id);

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }

    console.log('Notification supprimée:', notification._id);
    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression notification admin:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Suppression multiple (admin)
const deleteMultipleAdmin = async (req, res) => {
  try {
    const { ids } = req.body;

    console.log('=== SUPPRESSION MULTIPLE ADMIN ===');
    console.log('IDs:', ids);

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Liste d\'IDs requise' });
    }

    const result = await Notification.deleteMany({ _id: { $in: ids } });

    console.log(`${result.deletedCount} notifications supprimées`);
    res.json({ 
      message: `${result.deletedCount} notification(s) supprimée(s)`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Erreur suppression multiple admin:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer tous les chefs pour l'admin
const getChefsForAdmin = async (req, res) => {
  try {
    console.log('=== RÉCUPÉRATION CHEFS POUR ADMIN ===');
    
    const chefs = await ChefDeClasse.find({}, 'nom prenom classe email')
      .sort({ nom: 1, prenom: 1 });

    console.log(`Trouvé ${chefs.length} chefs de classe`);
    res.json(chefs);
  } catch (error) {
    console.error('Erreur récupération chefs admin:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

module.exports = {
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
};