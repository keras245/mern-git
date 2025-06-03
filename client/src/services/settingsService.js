import api from './api';

export const settingsService = {
  // Récupérer les paramètres
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },

  // Mettre à jour une section de paramètres
  updateSettings: async (section, data) => {
    const response = await api.put('/settings', { section, data });
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    const response = await api.put('/settings/profile', profileData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await api.post('/settings/change-password', passwordData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/settings/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Réinitialiser les paramètres
  resetSettings: async (section = 'all') => {
    const response = await api.post('/settings/reset', { section });
    return response.data;
  },

  // Obtenir les statistiques du profil
  getProfileStats: async () => {
    const response = await api.get('/settings/profile/stats');
    return response.data;
  },

  // Exporter les paramètres
  exportSettings: async () => {
    const response = await api.get('/settings/export', {
      responseType: 'blob'
    });
    
    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'settings-export.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Importer les paramètres
  importSettings: async (settingsData) => {
    const response = await api.post('/settings/import', { settingsData });
    return response.data;
  }
};

export default settingsService; 