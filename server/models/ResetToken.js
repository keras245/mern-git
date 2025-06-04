const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Administrateur',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // Expire après 1 heure
  }
});

module.exports = mongoose.model('ResetToken', resetTokenSchema); 