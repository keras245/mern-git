import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Calendar, 
  Users, 
  Clock,
  TrendingUp,
  Award,
  Target,
  Zap
} from 'lucide-react';
import api from '../../services/api';

export default function ProfileStats() {
  const [stats, setStats] = useState({
    monthsActive: 0,
    totalLogins: 0,
    emploisCreated: 0,
    activityRate: 0,
    lastLogin: null,
    totalSessions: 0,
    averageSessionTime: 0,
    tasksCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // Pour l'instant, on utilise des données fictives
      // const response = await api.get('/settings/profile/stats');
      // setStats(response.data);
      
      // Simulation de données
      setTimeout(() => {
        setStats({
          monthsActive: 12,
          totalLogins: 156,
          emploisCreated: 24,
          activityRate: 89,
          lastLogin: new Date().toISOString(),
          totalSessions: 134,
          averageSessionTime: 45, // minutes
          tasksCompleted: 267
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setLoading(false);
    }
  };

  const formatLastLogin = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)} j`;
  };

  const getActivityLevel = (rate) => {
    if (rate >= 80) return { level: 'Très actif', color: 'green' };
    if (rate >= 60) return { level: 'Actif', color: 'blue' };
    if (rate >= 40) return { level: 'Modéré', color: 'yellow' };
    return { level: 'Faible', color: 'red' };
  };

  const activityLevel = getActivityLevel(stats.activityRate);

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statItems = [
    {
      label: 'Mois d\'activité',
      value: stats.monthsActive,
      icon: Calendar,
      color: 'blue',
      suffix: 'mois'
    },
    {
      label: 'Connexions totales',
      value: stats.totalLogins,
      icon: Activity,
      color: 'green',
      suffix: ''
    },
    {
      label: 'Emplois créés',
      value: stats.emploisCreated,
      icon: Target,
      color: 'purple',
      suffix: ''
    },
    {
      label: 'Taux d\'activité',
      value: stats.activityRate,
      icon: TrendingUp,
      color: activityLevel.color,
      suffix: '%'
    },
    {
      label: 'Sessions totales',
      value: stats.totalSessions,
      icon: Users,
      color: 'orange',
      suffix: ''
    },
    {
      label: 'Temps moyen/session',
      value: stats.averageSessionTime,
      icon: Clock,
      color: 'indigo',
      suffix: 'min'
    },
    {
      label: 'Tâches accomplies',
      value: stats.tasksCompleted,
      icon: Award,
      color: 'pink',
      suffix: ''
    },
    {
      label: 'Dernière connexion',
      value: formatLastLogin(stats.lastLogin),
      icon: Zap,
      color: 'gray',
      suffix: '',
      isText: true
    }
  ];

  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    red: 'text-red-600 bg-red-100',
    orange: 'text-orange-600 bg-orange-100',
    indigo: 'text-indigo-600 bg-indigo-100',
    pink: 'text-pink-600 bg-pink-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200"
    >
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-gray-900 text-lg">📊 Statistiques du profil</h4>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${colorClasses[activityLevel.color]}`}>
          {activityLevel.level}
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[item.color]}`}>
                  <Icon size={16} />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">
                  {item.isText ? item.value : `${item.value}${item.suffix}`}
                </div>
                <div className="text-xs text-gray-500 leading-tight">
                  {item.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Graphique d'activité simplifié */}
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-100">
        <h5 className="font-medium text-gray-900 mb-3">Activité des 7 derniers jours</h5>
        <div className="flex items-end space-x-2 h-20">
          {[65, 45, 78, 52, 89, 67, 91].map((height, index) => (
            <motion.div
              key={index}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t min-h-[4px]"
              title={`${height}% d'activité`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
            <span key={index}>{day}</span>
          ))}
        </div>
      </div>

      {/* Badges de réussite */}
      <div className="mt-6">
        <h5 className="font-medium text-gray-900 mb-3">🏆 Badges de réussite</h5>
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Premier mois', icon: '🎯', earned: true },
            { name: 'Créateur actif', icon: '⚡', earned: stats.emploisCreated >= 10 },
            { name: 'Utilisateur régulier', icon: '🌟', earned: stats.totalLogins >= 100 },
            { name: 'Expert système', icon: '🚀', earned: stats.monthsActive >= 6 },
            { name: 'Gestionnaire pro', icon: '💎', earned: stats.activityRate >= 80 },
            { name: 'Contributeur', icon: '🏅', earned: stats.tasksCompleted >= 200 }
          ].map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg text-center transition-all ${
                badge.earned 
                  ? 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800' 
                  : 'bg-gray-100 border border-gray-200 text-gray-400'
              }`}
            >
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium">{badge.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
} 