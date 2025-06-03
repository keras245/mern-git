import { useState, useEffect, useCallback } from 'react';
import settingsService from '../services/settingsService';
import { useNotification } from '../context/NotificationContext';

export const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  // Charger les paramètres
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      showNotification('Erreur lors du chargement des paramètres', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // Sauvegarder une section
  const saveSection = useCallback(async (section, data) => {
    try {
      setSaving(true);
      await settingsService.updateSettings(section, data);
      
      // Mettre à jour l'état local
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], ...data }
      }));
      
      showNotification(`Paramètres ${section} sauvegardés avec succès`, 'success');
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showNotification]);

  // Mettre à jour un paramètre localement
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

  // Réinitialiser une section
  const resetSection = useCallback(async (section) => {
    try {
      setSaving(true);
      const response = await settingsService.resetSettings(section);
      
      if (section === 'all') {
        setSettings(response.settings);
      } else {
        setSettings(prev => ({
          ...prev,
          [section]: response.settings
        }));
      }
      
      showNotification(`Paramètres ${section} réinitialisés`, 'success');
      return true;
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      showNotification('Erreur lors de la réinitialisation', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  }, [showNotification]);

  // Charger au montage
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    loadSettings,
    saveSection,
    updateSetting,
    updateNestedSetting,
    resetSection
  };
};

export default useSettings; 