const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administrateur',
    required: true
  },
  userType: {
    type: String,
    enum: ['administrateur', 'chef', 'professeur'],
    required: true
  },
  token: {
    type: String,
    required: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    device: String,
    userAgent: String
  },
  location: {
    ip: String,
    country: String,
    city: String,
    region: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index pour la performance
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ token: 1 }, { unique: true });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Méthode pour mettre à jour la dernière activité
sessionSchema.methods.updateActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

// Méthode pour terminer une session
sessionSchema.methods.terminate = function() {
  this.isActive = false;
  this.logoutTime = new Date();
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema); 