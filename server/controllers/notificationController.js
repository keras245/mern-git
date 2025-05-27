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
    console.error('Erreur lors du marquage global:', error);
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

module.exports = {
  getNotifications,
  markAsRead,
  markAsUnread,
  toggleImportant,
  deleteNotification,
  markAllAsRead,
  deleteMultiple,
  createNotification
};