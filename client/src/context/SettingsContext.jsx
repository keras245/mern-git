import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les paramètres depuis l'API
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
      setError(err.message);
      
      // Paramètres par défaut en cas d'erreur
      setSettings({
        general: {
          siteName: 'EduFlex - Université Nongo Conakry',
          timezone: 'Africa/Conakry',
          language: 'fr',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          defaultPageSize: 10
        },
        security: {
          sessionTimeout: 30,
          passwordPolicy: 'medium',
          twoFactorAuth: false,
          loginAttempts: 5,
          passwordChangeInterval: 90,
          ipWhitelist: []
        },
        notifications: {
          emailNotifications: true,
          systemAlerts: true,
          feedbackNotifications: true,
          scheduleUpdates: true,
          presenceAlerts: true,
          emailAddress: '',
          notificationFrequency: 'instant',
          quietHours: {
            start: '22:00',
            end: '08:00'
          }
        },
        appearance: {
          theme: 'light',
          primaryColor: '#3B82F6',
          sidebarCollapsed: false,
          fontSize: 'medium',
          compactMode: false,
          showAnimations: true
        },
        profile: {
          avatar: '',
          bio: '',
          preferences: {
            dashboardLayout: 'grid',
            defaultView: 'dashboard'
          }
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour une section
  const updateSection = useCallback(async (section, data) => {
    try {
      await api.put('/settings', { section, data });
      
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
      
      return true;
    } catch (err) {
      console.error('Erreur mise à jour section:', err);
      throw err;
    }
  }, []);

  // Mettre à jour un paramètre spécifique
  const updateSetting = useCallback((section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  }, []);

  // Mettre à jour un paramètre imbriqué
  const updateNestedSetting = useCallback((section, parentKey, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentKey]: {
          ...prev[section][parentKey],
          [key]: value
        }
      }
    }));
  }, []);

  // Appliquer le thème en temps réel
  useEffect(() => {
    if (settings?.appearance) {
      const { theme, primaryColor, fontSize, compactMode } = settings.appearance;
      
      // Appliquer le thème
      document.documentElement.setAttribute('data-theme', theme);
      
      // Appliquer la couleur principale
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      
      // Appliquer la taille de police
      const fontSizes = {
        small: '14px',
        medium: '16px',
        large: '18px'
      };
      document.documentElement.style.setProperty('--base-font-size', fontSizes[fontSize]);
      
      // Appliquer le mode compact
      document.documentElement.classList.toggle('compact-mode', compactMode);
    }
  }, [settings?.appearance]);

  // Charger les paramètres au démarrage
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    updateSection,
    updateSetting,
    updateNestedSetting
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings doit être utilisé dans un SettingsProvider');
  }
  return context;
};

export default SettingsContext; 