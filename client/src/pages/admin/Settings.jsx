import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Palette, Globe, Bell, User, Database, Mail, Clock } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function Settings() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'EduFlex',
      timezone: 'Africa/Conakry',
      language: 'fr',
      dateFormat: 'DD/MM/YYYY'
    },
    security: {
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      twoFactorAuth: false,
      loginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      feedbackNotifications: true,
      scheduleUpdates: true
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      sidebarCollapsed: false
    }
  });

  const tabs = [
    { id: 'general', label: 'Général', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'profile', label: 'Profil', icon: User }
  ];

  const handleSave = (section) => {
    // Sauvegarder les paramètres
    showNotification(`Paramètres ${section} sauvegardés avec succès`, 'success');
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Paramètres</h1>
        <p className="text-gray-600">Configurez les paramètres de l'application EduFlex</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar des onglets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} className="mr-3" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Contenu des paramètres */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          {/* Paramètres Généraux */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Paramètres généraux</h3>
                <button
                  onClick={() => handleSave('généraux')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'application
                  </label>
                  <input
                    type="text"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuseau horaire
                  </label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Africa/Conakry">Conakry (GMT+0)</option>
                    <option value="Europe/Paris">Paris (GMT+1)</option>
                    <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Langue
                  </label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format de date
                  </label>
                  <select
                    value={settings.general.dateFormat}
                    onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Paramètres de Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Paramètres de sécurité</h3>
                <button
                  onClick={() => handleSave('de sécurité')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Changer le mot de passe</h4>
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    Modifier le mot de passe
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de session (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentatives de connexion max
                    </label>
                    <input
                      type="number"
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                      className="mr-3 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Authentification à deux facteurs (2FA)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Paramètres de Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Paramètres de notifications</h3>
                <button
                  onClick={() => handleSave('de notifications')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Notifications par email</span>
                    <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Alertes système</span>
                    <p className="text-sm text-gray-500">Notifications pour les erreurs et problèmes système</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => updateSetting('notifications', 'systemAlerts', e.target.checked)}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Notifications de feedback</span>
                    <p className="text-sm text-gray-500">Notifications lors de nouveaux feedbacks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.feedbackNotifications}
                    onChange={(e) => updateSetting('notifications', 'feedbackNotifications', e.target.checked)}
                    className="rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">Mises à jour d'emploi du temps</span>
                    <p className="text-sm text-gray-500">Notifications pour les changements d'emploi du temps</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.scheduleUpdates}
                    onChange={(e) => updateSetting('notifications', 'scheduleUpdates', e.target.checked)}
                    className="rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Paramètres d'Apparence */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Paramètres d'apparence</h3>
                <button
                  onClick={() => handleSave('d\'apparence')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Thème</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateSetting('appearance', 'theme', 'light')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        settings.appearance.theme === 'light'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-white rounded border mb-2"></div>
                      <span className="text-sm font-medium">Clair</span>
                    </button>
                    <button
                      onClick={() => updateSetting('appearance', 'theme', 'dark')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        settings.appearance.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-800 rounded border mb-2"></div>
                      <span className="text-sm font-medium">Sombre</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Couleur principale</label>
                  <div className="flex space-x-3">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSetting('appearance', 'primaryColor', color)}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${
                          settings.appearance.primaryColor === color
                            ? 'border-gray-400 scale-110'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paramètres de Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Informations du profil</h3>
                <button
                  onClick={() => handleSave('de profil')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-lg">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  A
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Administrateur Principal</h4>
                  <p className="text-gray-600">admin@nongo.edu.gn</p>
                  <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Changer la photo de profil
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    defaultValue="Administrateur"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    defaultValue="Principal"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="admin@nongo.edu.gn"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    defaultValue="+224 123 456 789"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 