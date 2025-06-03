import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Shield, 
  Palette, 
  Bell, 
  User, 
  Lock,
  Eye,
  EyeOff,
  Key,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor,
  Smartphone,
  Globe,
  Trash2,
  RefreshCw,
  Calendar,
  MapPin,
  Activity
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import api from '../../services/api';

export default function Settings() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('security');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // AJOUT : État pour tracker les erreurs de mot de passe
  const [passwordError, setPasswordError] = useState(null);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [settings, setSettings] = useState({
    security: {
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      loginAttempts: 5,
      passwordExpiry: 90,
      requirePasswordChange: false,
      passwordHistory: 5
    },
    notifications: {
      emailNotifications: true,
      systemAlerts: true,
      feedbackNotifications: true,
      scheduleUpdates: true,
    },
    appearance: {
      theme: 'light',
      primaryColor: '#3B82F6',
      sidebarCollapsed: false
    }
  });

  // Sessions actives (maintenant chargées depuis l'API)
  const [activeSessions, setActiveSessions] = useState([]);
  
  // Historique de connexion (maintenant chargé depuis l'API)
  const [loginHistory, setLoginHistory] = useState([]);

  // Charger les données depuis l'API
  useEffect(() => {
    if (activeTab === 'security') {
      loadActiveSessions();
      loadLoginHistory();
    }
  }, [activeTab]);

  const loadActiveSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sessions/active');
      if (response.data.success) {
        setActiveSessions(response.data.sessions || []);
      }
    } catch (error) {
      console.error('Erreur chargement sessions actives:', error);
      showNotification('Erreur lors du chargement des sessions actives', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      const response = await api.get('/sessions/history?limit=10&days=7');
      if (response.data.success) {
        setLoginHistory(response.data.history || []);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      showNotification('Erreur lors du chargement de l\'historique', 'error');
    }
  };

  const tabs = [
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

  const handlePasswordChange = async () => {
    // Réinitialiser les erreurs
    setPasswordError(null);
    
    // Validation côté client
    if (!passwordForm.currentPassword) {
      showNotification('Le mot de passe actuel est requis', 'error');
      return;
    }

    if (!passwordForm.newPassword) {
      showNotification('Le nouveau mot de passe est requis', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 8) {
      showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.patch('/administrateurs/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        showNotification('Mot de passe mis à jour avec succès', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification(response.data.message || 'Erreur lors de la mise à jour', 'error');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      
      // Gestion des erreurs sans stockage d'état
      if (error.response?.status === 400 && error.response?.data?.errorType === 'CURRENT_PASSWORD_INVALID') {
        showNotification(error.response.data.message, 'error');
      } else if (error.response?.status === 401) {
        showNotification('Session expirée, veuillez vous reconnecter', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response?.data?.message) {
        showNotification(error.response.data.message, 'error');
      } else {
        showNotification('Erreur lors de la mise à jour du mot de passe', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const terminateSession = async (sessionId) => {
    try {
      const response = await api.delete(`/sessions/${sessionId}`);
      if (response.data.success) {
        setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
        showNotification('Session terminée avec succès', 'success');
      }
    } catch (error) {
      console.error('Erreur terminaison session:', error);
      showNotification('Erreur lors de la terminaison de la session', 'error');
    }
  };

  const terminateAllSessions = async () => {
    try {
      const response = await api.delete('/sessions/others/all');
      if (response.data.success) {
        setActiveSessions(prev => prev.filter(session => session.current));
        showNotification(`${response.data.count || 0} session(s) terminée(s)`, 'success');
        loadActiveSessions(); // Recharger la liste
      }
    } catch (error) {
      console.error('Erreur terminaison sessions:', error);
      showNotification('Erreur lors de la terminaison des sessions', 'error');
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'Faible', color: 'bg-red-500', textColor: 'text-red-600' };
    if (strength <= 3) return { level: 'Moyen', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    if (strength <= 4) return { level: 'Fort', color: 'bg-blue-500', textColor: 'text-blue-600' };
    return { level: 'Très fort', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const formatLastActivity = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diff = now - activityDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${days}j`;
  };

  // CORRECTION : Fonction pour appliquer le thème avec effet immédiat
  const applyTheme = (theme) => {
    // Mettre à jour l'état local
    updateSetting('appearance', 'theme', theme);
    
    // Appliquer le thème au document IMMÉDIATEMENT
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Notification de confirmation
    showNotification(`Thème ${theme === 'dark' ? 'sombre' : 'clair'} appliqué`, 'success');
  };

  // CORRECTION : Charger le thème au montage du composant
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      updateSetting('appearance', 'theme', savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // CORRECTION : handleAppearanceSave simplifié (le thème est déjà appliqué)
  const handleAppearanceSave = () => {
    // Sauvegarder la couleur principale dans localStorage
    localStorage.setItem('primaryColor', settings.appearance.primaryColor);
    
    // Appliquer la couleur principale via CSS custom properties
    document.documentElement.style.setProperty('--primary-color', settings.appearance.primaryColor);
    
    showNotification('Paramètres d\'apparence sauvegardés avec succès', 'success');
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Paramètres</h1>
        <p className="text-gray-600 dark:text-gray-300">Configurez les paramètres de l'application EduFlex</p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar des onglets */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
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
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
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
          className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
        >
          {/* SECTION SÉCURITÉ AMÉLIORÉE */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sécurité et Protection</h3>
                  <p className="text-gray-600 dark:text-gray-300">Gérez la sécurité de votre compte et surveillez l'activité</p>
                </div>
                <button
                  onClick={() => handleSave('de sécurité')}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <Save size={18} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              {/* Changement de mot de passe */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl"
              >
                <div className="flex items-center mb-4">
                  <Lock className="w-6 h-6 text-yellow-600 mr-3" />
                  <h4 className="text-lg font-bold text-yellow-800">Changer le mot de passe</h4>
                </div>
                <p className="text-yellow-700 mb-6">Utilisez un mot de passe fort pour protéger votre compte</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        placeholder="Mot de passe actuel"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                        placeholder="Nouveau mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordForm.newPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Force du mot de passe</span>
                          <span className={`text-xs font-medium ${getPasswordStrength(passwordForm.newPassword).textColor}`}>
                            {getPasswordStrength(passwordForm.newPassword).level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(passwordForm.newPassword).color}`}
                            style={{ width: `${(getPasswordStrength(passwordForm.newPassword).level === 'Faible' ? 20 : getPasswordStrength(passwordForm.newPassword).level === 'Moyen' ? 40 : getPasswordStrength(passwordForm.newPassword).level === 'Fort' ? 70 : 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirmer mot de passe</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 ${
                          passwordForm.confirmPassword && passwordForm.newPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                        placeholder="Confirmer mot de passe"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword && (
                      <div className="mt-1 text-xs">
                        {passwordForm.confirmPassword === passwordForm.newPassword ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle size={12} className="mr-1" />
                            Les mots de passe correspondent
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center">
                            <XCircle size={12} className="mr-1" />
                            Les mots de passe ne correspondent pas
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handlePasswordChange}
                  disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                  className={`mt-4 px-6 py-3 text-white rounded-xl transition-colors font-medium flex items-center ${
                    loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Lock size={16} className="mr-2" />
                      Mettre à jour le mot de passe
                    </>
                  )}
                </button>
              </motion.div>

              {/* Politique de sécurité */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 border border-gray-200 rounded-2xl"
              >
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Politique de sécurité
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timeout de session (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 heure</option>
                      <option value={120}>2 heures</option>
                      <option value={480}>8 heures</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tentatives de connexion max
                    </label>
                    <select
                      value={settings.security.loginAttempts}
                      onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={3}>3 tentatives</option>
                      <option value={5}>5 tentatives</option>
                      <option value={10}>10 tentatives</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiration mot de passe (jours)
                    </label>
                    <select
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting('security', 'passwordExpiry', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={30}>30 jours</option>
                      <option value={60}>60 jours</option>
                      <option value={90}>90 jours</option>
                      <option value={180}>180 jours</option>
                      <option value={0}>Jamais</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Historique mots de passe
                    </label>
                    <select
                      value={settings.security.passwordHistory}
                      onChange={(e) => updateSetting('security', 'passwordHistory', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Aucun</option>
                      <option value={3}>3 derniers</option>
                      <option value={5}>5 derniers</option>
                      <option value={10}>10 derniers</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {/* SECTIONS SUPPRIMÉES : 2FA et Sessions multiples */}
                </div>
              </motion.div>

              {/* Sessions actives */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 border border-gray-200 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-green-600" />
                    Sessions actives
                    {loading && (
                      <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    )}
                  </h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={loadActiveSessions}
                      className="flex items-center px-3 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                      disabled={loading}
                    >
                      <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                      Actualiser
                    </button>
                    <button
                      onClick={terminateAllSessions}
                      className="flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                      disabled={loading}
                    >
                      <XCircle size={16} className="mr-2" />
                      Terminer toutes les autres
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeSessions.length === 0 && !loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <Monitor className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucune session active trouvée</p>
                      <button
                        onClick={loadActiveSessions}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Actualiser la liste
                      </button>
                    </div>
                  ) : (
                    activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {session.deviceType === 'desktop' ? 
                              <Monitor className="w-5 h-5 text-blue-600" /> : 
                              <Smartphone className="w-5 h-5 text-blue-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                              {session.browser}
                              {session.current && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  Session actuelle
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {session.location} • {session.ip}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Dernière activité: {formatLastActivity(session.lastActivity)}
                            </p>
                          </div>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => terminateSession(session.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Terminer cette session"
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Historique de connexion */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 border border-gray-200 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    Historique de connexion (7 derniers jours)
                  </h4>
                  <button
                    onClick={loadLoginHistory}
                    className="flex items-center px-3 py-2 text-purple-600 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                    disabled={loading}
                  >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Actualiser
                  </button>
                </div>

                <div className="space-y-3">
                  {loginHistory.length === 0 && !loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Aucun historique de connexion disponible</p>
                    </div>
                  ) : (
                    loginHistory.map((login) => (
                      <div key={login.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${login.success ? 'bg-green-100' : 'bg-red-100'}`}>
                            {login.success ? 
                              <CheckCircle className="w-5 h-5 text-green-600" /> : 
                              <XCircle className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                              {login.success ? 'Connexion réussie' : 'Tentative de connexion échouée'}
                              {login.isActive && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                  Active
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              {login.device} • {login.ip}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {login.location}
                              {login.duration && (
                                <span className="ml-2">• Durée: {login.duration} min</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900">
                            {new Date(login.timestamp).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(login.timestamp).toLocaleTimeString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Paramètres d'apparence</h3>
                <button
                  onClick={handleAppearanceSave}
                  className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                >
                  <Save size={16} className="mr-2" />
                  Sauvegarder
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thème</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => applyTheme('light')}
                      className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                        settings.appearance.theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-20 bg-white rounded border mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Clair</span>
                      {settings.appearance.theme === 'light' && (
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">✓ Actuel</div>
                      )}
                    </button>
                    <button
                      onClick={() => applyTheme('dark')}
                      className={`p-4 border-2 rounded-lg transition-all hover:shadow-md ${
                        settings.appearance.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-800 rounded border mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-400 rounded"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Sombre</span>
                      {settings.appearance.theme === 'dark' && (
                        <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-medium">✓ Actuel</div>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Le thème sera appliqué immédiatement à toute l'application
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Couleur principale</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { color: '#3B82F6', name: 'Bleu' },
                      { color: '#10B981', name: 'Vert' },
                      { color: '#F59E0B', name: 'Orange' },
                      { color: '#EF4444', name: 'Rouge' },
                      { color: '#8B5CF6', name: 'Violet' },
                      { color: '#06B6D4', name: 'Cyan' }
                    ].map(({ color, name }) => (
                      <button
                        key={color}
                        onClick={() => updateSetting('appearance', 'primaryColor', color)}
                        className={`relative w-12 h-12 rounded-full border-4 transition-all hover:scale-105 ${
                          settings.appearance.primaryColor === color
                            ? 'border-gray-400 scale-110 shadow-lg'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                        style={{ backgroundColor: color }}
                        title={name}
                      >
                        {settings.appearance.primaryColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    La couleur sera appliquée après sauvegarde
                  </p>
                </div>

                {/* CORRECTION : Aperçu en temps réel */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Aperçu</h4>
                  <div className={`p-4 rounded-lg ${
                    settings.appearance.theme === 'dark' 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: settings.appearance.primaryColor }}
                      ></div>
                      <span className="text-sm">
                        Thème {settings.appearance.theme === 'dark' ? 'sombre' : 'clair'} avec couleur principale
                      </span>
                    </div>
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