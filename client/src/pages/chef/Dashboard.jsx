import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  CheckSquare, 
  MessageSquare, 
  Bell,
  TrendingUp,
  Clock,
  AlertCircle,
  BookOpen,
  UserCheck,
  Eye,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    coursAujourdhui: 0,
    presencesDeclarees: 0,
    feedbackEnvoyes: 0,
    notificationsNonLues: 0
  });

  const [emploiDuJour, setEmploiDuJour] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emploiDuTemps, setEmploiDuTemps] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    chargerDonneesDashboard();
  }, []);

  const chargerDonneesDashboard = async () => {
    try {
      setLoading(true);
      
      // Simuler des données pour le moment (à remplacer par de vraies API)
      const statsData = {
        coursAujourdhui: 4,
        presencesDeclarees: 12,
        feedbackEnvoyes: 3,
        notificationsNonLues: 5
      };

      const emploiData = [
        {
          id: 1,
          matiere: 'Mathématiques',
          professeur: 'Dr. Diallo',
          horaire: '08h30 - 11h30',
          salle: 'A101',
          statut: 'present',
          couleur: 'bg-green-500'
        },
        {
          id: 2,
          matiere: 'Physique',
          professeur: 'Prof. Camara',
          horaire: '12h00 - 15h00',
          salle: 'B205',
          statut: 'absent',
          couleur: 'bg-red-500'
        },
        {
          id: 3,
          matiere: 'Informatique',
          professeur: 'Dr. Touré',
          horaire: '15h30 - 18h30',
          salle: 'C301',
          statut: 'en_attente',
          couleur: 'bg-yellow-500'
        }
      ];

      const notificationsData = [
        {
          id: 1,
          type: 'info',
          message: 'Nouveau message de l\'administrateur',
          temps: 'Il y a 5 minutes',
          couleur: 'bg-blue-500',
          lu: false
        },
        {
          id: 2,
          type: 'warning',
          message: 'Rappel : Déclaration des présences',
          temps: 'Il y a 1 heure',
          couleur: 'bg-yellow-500',
          lu: false
        },
        {
          id: 3,
          type: 'success',
          message: 'Feedback envoyé avec succès',
          temps: 'Il y a 2 heures',
          couleur: 'bg-green-500',
          lu: true
        }
      ];

      setStats(statsData);
      setEmploiDuJour(emploiData);
      setNotifications(notificationsData);
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Cours aujourd\'hui',
      value: stats.coursAujourdhui,
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/chef/emploi-temps'
    },
    {
      title: 'Présences déclarées',
      value: stats.presencesDeclarees,
      icon: CheckSquare,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/chef/presences'
    },
    {
      title: 'Feedback envoyés',
      value: stats.feedbackEnvoyes,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/chef/feedback'
    },
    {
      title: 'Notifications',
      value: stats.notificationsNonLues,
      icon: Bell,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/chef/notifications'
    }
  ];

  const getStatutBadge = (statut) => {
    switch (statut) {
      case 'present':
        return <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Présent</span>;
      case 'absent':
        return <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Absent</span>;
      case 'en_attente':
        return <span className="px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">En attente</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">Non défini</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bienvenue, {user.prenom} {user.nom} 👋
            </h1>
            <p className="text-green-100 text-lg mb-2">
              Chef de Classe - {user.classe}
            </p>
            <p className="text-green-200">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-6xl">👨‍🏫</span>
            </div>
          </div>
        </div>
            </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
            <motion.div
            key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link 
              to={stat.link}
              className="block bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    Voir détails <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </Link>
            </motion.div>
          ))}
        </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Emploi du temps du jour */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Emploi du temps du jour</h2>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <Link 
                to="/chef/emploi-temps"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
                </div>
              </div>
          
          <div className="space-y-4">
            {emploiDuJour.map((cours, index) => (
              <motion.div
                key={cours.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${cours.couleur}`}></div>
                <div>
                    <p className="font-semibold text-gray-900">{cours.matiere}</p>
                    <p className="text-sm text-gray-600">{cours.professeur}</p>
                    <p className="text-xs text-gray-500">{cours.horaire} • Salle {cours.salle}</p>
                </div>
              </div>
                <div className="flex items-center space-x-3">
                  {getStatutBadge(cours.statut)}
                  <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-gray-600 transition-all">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
              </div>

          {emploiDuJour.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun cours programmé aujourd'hui</p>
            </div>
          )}
          </motion.div>

        {/* Notifications récentes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-red-600" />
              <Link 
                to="/chef/notifications"
                className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center"
              >
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
                </div>
              </div>
          
          <div className="space-y-4">
            {notifications.slice(0, 4).map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className={`flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
                  !notification.lu ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${notification.couleur} mt-2 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium mb-1 ${!notification.lu ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500">{notification.temps}</p>
                </div>
                {!notification.lu && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </motion.div>
            ))}
              </div>

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune notification</p>
                </div>
          )}
        </motion.div>
              </div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/chef/presences">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 group cursor-pointer"
            >
              <CheckSquare className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-blue-900">Déclarer présences</span>
            </motion.div>
          </Link>
          
          <Link to="/chef/feedback">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 group cursor-pointer"
            >
              <MessageSquare className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-green-900">Envoyer feedback</span>
            </motion.div>
          </Link>
          
          <Link to="/chef/emploi-temps">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 group cursor-pointer"
            >
              <Calendar className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-purple-900">Voir emploi du temps</span>
            </motion.div>
          </Link>
            </div>
          </motion.div>
        </div>
  );
};

export default Dashboard;
