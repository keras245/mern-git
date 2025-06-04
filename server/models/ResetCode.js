const mongoose = require('mongoose');

const resetCodeSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administrateur',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900 // Expire après 15 minutes
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3 // Maximum 3 tentatives
  }
});

module.exports = mongoose.model('ResetCode', resetCodeSchema); 