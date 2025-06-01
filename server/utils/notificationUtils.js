const Notification = require('../models/Notification');

class NotificationUtils {
  // Notification pour changement d'emploi du temps
  static async notifyScheduleChange(programme, details) {
    const notificationData = {
      title: 'Modification d\'emploi du temps',
      message: `L'emploi du temps de ${programme} a été modifié. ${details}`,
      type: 'schedule',
      important: true,
      sender: 'Système',
      senderType: 'system'
    };

    return await Notification.sendToAllChefs(notificationData);
  }

  // Notification pour nouveau feedback
  static async notifyNewFeedback(feedbackId, chefNom, titre) {
    const notificationData = {
      title: 'Nouveau feedback reçu',
      message: `${chefNom} a envoyé un nouveau feedback: "${titre}"`,
      type: 'message',
      important: false,
      sender: 'Système',
      senderType: 'system',
      recipient: 'admin',
      recipientType: 'admin'
    };

    return await Notification.createNotification(notificationData);
  }

  // Notification pour présence non déclarée
  static async notifyMissingAttendance(chefId, cours, date) {
    const notificationData = {
      title: 'Présence non déclarée',
      message: `Rappel: La présence pour le cours "${cours}" du ${date} n'a pas été déclarée.`,
      type: 'warning',
      important: true,
      sender: 'Système',
      senderType: 'system',
      recipient: chefId,
      recipientType: 'chef'
    };

    return await Notification.createNotification(notificationData);
  }

  // Notification de maintenance système
  static async notifySystemMaintenance(startTime, endTime) {
    const notificationData = {
      title: 'Maintenance système programmée',
      message: `Le système sera en maintenance de ${startTime} à ${endTime}. Aucune donnée ne sera perdue.`,
      type: 'info',
      important: true,
      sender: 'Administration',
      senderType: 'admin'
    };

    return await Notification.sendToAllChefs(notificationData);
  }

  // Notification de feedback traité
  static async notifyFeedbackProcessed(chefId, feedbackTitre, reponse) {
    const notificationData = {
      title: 'Feedback traité',
      message: `Votre feedback "${feedbackTitre}" a été traité par l'administration.`,
      type: 'success',
      important: false,
      sender: 'Administration',
      senderType: 'admin',
      recipient: chefId,
      recipientType: 'chef'
    };

    return await Notification.createNotification(notificationData);
  }

  // Notification d'urgence
  static async notifyEmergency(title, message) {
    const notificationData = {
      title,
      message,
      type: 'error',
      important: true,
      sender: 'Direction',
      senderType: 'admin'
    };

    return await Notification.sendToAllChefs(notificationData);
  }
}

module.exports = NotificationUtils; 