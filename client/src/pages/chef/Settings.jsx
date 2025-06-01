import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Save, 
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const Settings = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      classe: ''
    },
    notifications: {
      emailNotifications: true,
      scheduleUpdates: true,
      absenceAlerts: true,
      feedbackNotifications: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30
    },
    appearance: {
      theme: 'light',
      primaryColor: '#10B981'
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'appearance', label: 'Apparence', icon: Palette }
  ];

  useEffect(() => {
    // Charger les données de l'utilisateur
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setSettings(prev => ({
      ...prev,
      profile: {
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        classe: user.classe || ''
      }
    }));
  }, []);

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleSave = async (section) => {
    try {
      // Ici vous pourriez faire un appel API pour sauvegarder
      // await api.put('/chef/settings', { [section]: settings[section] });
      
      showNotification(`Paramètres de ${section} mis à jour avec succès`, 'success');
      
      // Mettre à jour le localStorage pour le profil
      if (section === 'profil') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...user, ...settings.profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showNotification('Erreur lors de la sauvegarde', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/chef/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">Gérez vos préférences et paramètres de compte</p>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Navigation des onglets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-64 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-fit"
        >
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-green-50 text-green-600 border border-green-200'
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

        {/* Contenu des onglets */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={settings.profile.prenom}
                    onChange={(e) => updateSetting('profile', 'prenom', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={settings.profile.nom}
                    onChange={(e) => updateSetting('profile', 'nom', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={settings.profile.telephone}
                    onChange={(e) => updateSetting('profile', 'telephone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classe</label>
                  <input
                    type="text"
                    value={settings.profile.classe}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">La classe ne peut pas être modifiée</p>
                </div>
              </div>
              
              <button
                onClick={() => handleSave('profil')}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Save size={20} className="mr-2" />
                Sauvegarder
              </button>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Préférences de notification</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Notifications par email</h3>
                    <p className="text-sm text-gray-500">Recevoir les notifications importantes par email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailNotifications}
                      onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Mises à jour d'emploi du temps</h3>
                    <p className="text-sm text-gray-500">Être notifié des changements d'emploi du temps</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.scheduleUpdates}
                      onChange={(e) => updateSetting('notifications', 'scheduleUpdates', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Alertes d'absence</h3>
                    <p className="text-sm text-gray-500">Notifications pour les absences importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.absenceAlerts}
                      onChange={(e) => updateSetting('notifications', 'absenceAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Notifications de feedback</h3>
                    <p className="text-sm text-gray-500">Recevoir les réponses aux feedbacks envoyés</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications.feedbackNotifications}
                      onChange={(e) => updateSetting('notifications', 'feedbackNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
              
              <button
                onClick={() => handleSave('notifications')}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Save size={20} className="mr-2" />
                Sauvegarder
              </button>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres de sécurité</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h3 className="font-medium text-gray-900">Authentification à deux facteurs</h3>
                    <p className="text-sm text-gray-500">Ajouter une couche de sécurité supplémentaire</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-center mb-3">
                    <Clock size={20} className="mr-2 text-gray-600" />
                    <h3 className="font-medium text-gray-900">Délai d'expiration de session</h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Durée avant déconnexion automatique (en minutes)</p>
                  <select
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 heure</option>
                    <option value={120}>2 heures</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={() => handleSave('sécurité')}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Save size={20} className="mr-2" />
                Sauvegarder
              </button>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personnalisation de l'interface</h2>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-3">Thème</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateSetting('appearance', 'theme', 'light')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        settings.appearance.theme === 'light'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-white rounded-lg border border-gray-200 mb-2"></div>
                      <p className="text-sm font-medium">Clair</p>
                    </button>
                    
                    <button
                      onClick={() => updateSetting('appearance', 'theme', 'dark')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        settings.appearance.theme === 'dark'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-800 rounded-lg border border-gray-600 mb-2"></div>
                      <p className="text-sm font-medium">Sombre</p>
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-xl">
                  <h3 className="font-medium text-gray-900 mb-3">Couleur principale</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { name: 'Vert', value: '#10B981' },
                      { name: 'Bleu', value: '#3B82F6' },
                      { name: 'Violet', value: '#8B5CF6' },
                      { name: 'Orange', value: '#F59E0B' }
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateSetting('appearance', 'primaryColor', color.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          settings.appearance.primaryColor === color.value
                            ? 'border-gray-400'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div
                          className="w-full h-8 rounded-lg mb-2"
                          style={{ backgroundColor: color.value }}
                        ></div>
                        <p className="text-xs font-medium">{color.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleSave('apparence')}
                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Save size={20} className="mr-2" />
                Sauvegarder
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings; 