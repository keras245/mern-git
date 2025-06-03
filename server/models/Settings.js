const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  // Référence à l'administrateur
  administrateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administrateur',
    required: true,
    unique: true
  },
  
  // Paramètres généraux
  general: {
    siteName: {
      type: String,
      default: 'EduFlex - Université Nongo Conakry'
    },
    timezone: {
      type: String,
      default: 'Africa/Conakry'
    },
    language: {
      type: String,
      enum: ['fr', 'en', 'ar'],
      default: 'fr'
    },
    dateFormat: {
      type: String,
      enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['24h', '12h'],
      default: '24h'
    },
    defaultPageSize: {
      type: Number,
      default: 10,
      min: 5,
      max: 100
    }
  },
  
  // Paramètres de sécurité
  security: {
    sessionTimeout: {
      type: Number,
      default: 30,
      min: 15,
      max: 480 // 8 heures max
    },
    passwordPolicy: {
      type: String,
      enum: ['basic', 'medium', 'strong'],
      default: 'medium'
    },
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10
    },
    passwordChangeInterval: {
      type: Number,
      default: 90, // jours
      min: 30,
      max: 365
    },
    ipWhitelist: [{
      type: String
    }]
  },
  
  // Paramètres de notifications
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    systemAlerts: {
      type: Boolean,
      default: true
    },
    feedbackNotifications: {
      type: Boolean,
      default: true
    },
    scheduleUpdates: {
      type: Boolean,
      default: true
    },
    presenceAlerts: {
      type: Boolean,
      default: true
    },
    emailAddress: {
      type: String
    },
    notificationFrequency: {
      type: String,
      enum: ['instant', 'hourly', 'daily', 'weekly'],
      default: 'instant'
    },
    quietHours: {
      start: {
        type: String,
        default: '22:00'
      },
      end: {
        type: String,
        default: '08:00'
      }
    }
  },
  
  // Paramètres d'apparence
  appearance: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    primaryColor: {
      type: String,
      default: '#3B82F6'
    },
    sidebarCollapsed: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    showAnimations: {
      type: Boolean,
      default: true
    }
  },
  
  // Paramètres de profil
  profile: {
    avatar: {
      type: String, // URL de l'image
      default: ''
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    preferences: {
      dashboardLayout: {
        type: String,
        enum: ['grid', 'list', 'cards'],
        default: 'grid'
      },
      defaultView: {
        type: String,
        enum: ['dashboard', 'schedules', 'notifications'],
        default: 'dashboard'
      }
    }
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
settingsSchema.index({ administrateur: 1 });

module.exports = mongoose.model('Settings', settingsSchema); 