const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'message', 'schedule'],
    default: 'info'
  },
  recipient: {
    type: String,
    required: true // ID du chef de classe ou 'all' pour tous
  },
  recipientType: {
    type: String,
    enum: ['chef', 'admin', 'all'],
    default: 'chef'
  },
  sender: {
    type: String,
    required: true
  },
  senderType: {
    type: String,
    enum: ['admin', 'system', 'direction'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  important: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  metadata: {
    relatedId: String, // ID de l'objet lié (cours, emploi du temps, etc.)
    relatedType: String, // Type de l'objet lié
    actionUrl: String // URL d'action si applicable
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ type: 1 });

// Méthode pour marquer comme lu
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Méthode pour marquer comme important
notificationSchema.methods.toggleImportant = function() {
  this.important = !this.important;
  return this.save();
};

// Méthode statique pour créer une notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Méthode statique pour envoyer à tous les chefs de classe
notificationSchema.statics.sendToAllChefs = async function(notificationData) {
  const ChefDeClasse = require('./ChefDeClasse');
  const chefs = await ChefDeClasse.find({}, '_id');
  
  const notifications = chefs.map(chef => ({
    ...notificationData,
    recipient: chef._id.toString(),
    recipientType: 'chef'
  }));
  
  return await this.insertMany(notifications);
};

module.exports = mongoose.model('Notification', notificationSchema); 