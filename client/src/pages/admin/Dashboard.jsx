import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  BookOpen,
  Bell,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Area,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("emploi-du-temps");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const tabs = [
    { id: "emploi-du-temps", label: "Emploi du temps", icon: Calendar },
    { id: "presences", label: "Présences", icon: Users },
    { id: "feedback", label: "Feedback", icon: BookOpen },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "statistiques", label: "Statistiques", icon: BarChart2 },
    { id: "parametres", label: "Paramètres", icon: Settings },
  ];

  const stats = [
    { title: "Classes", value: "12", icon: "📚" },
    { title: "Enseignants", value: "45", icon: "🏫" },
    { title: "Étudiants", value: "1200", icon: "👨‍🎓" },
    { title: "Cours", value: "156", icon: "📝" },
  ];

  // Exemple de données
  const profData = [
    { name: "Oumar Bah", semaine: 5, mois: 18 },
    { name: "Tamba Tonguino Sylla", semaine: 3, mois: 12 },
    { name: "Nouhou Sow", semaine: 4, mois: 15 },
    { name: "Diaby Kalil", semaine: 2, mois: 8 },
  ];

  // Exemple de données (à remplacer par tes vraies stats)
  const presenceEvolution = [
    { semaine: "Semaine 1", taux: 85 },
    { semaine: "Semaine 2", taux: 90 },
    { semaine: "Semaine 3", taux: 80 },
    { semaine: "Semaine 4", taux: 95 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de bord administrateur
        </h1>
        <p className="mt-2 text-gray-600">
          Bienvenue dans votre espace de gestion
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Activités récentes</h2>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                Mise à jour de l'emploi du temps - L1 Info
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <p className="text-gray-600">
                Nouveau feedback reçu - Mathématiques
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <p className="text-gray-600">Absence signalée - Physique</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Tâches prioritaires</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Vérifier les présences de la semaine
              </p>
              <span className="text-sm text-red-500">Urgent</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Mettre à jour l'emploi du temps</p>
              <span className="text-sm text-yellow-500">En cours</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Répondre aux feedbacks</p>
              <span className="text-sm text-green-500">En attente</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Graphes statistiques */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          Statistiques de présence des professeurs
        </h2>
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={profData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="semaine"
                fill="#3b82f6"
                name="Présences cette semaine"
              />
              <Bar dataKey="mois" fill="#10b981" name="Présences ce mois" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Courbe d'évolution */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-xl font-semibold mb-4">
            Évolution du taux de présence des professeurs (ce mois)
          </h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={presenceEvolution}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorTaux" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semaine" />
              <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              {/* Area pour le gradient sous la courbe */}
              <Area
                type="monotone"
                dataKey="taux"
                stroke="none"
                fill="url(#colorTaux)"
                isAnimationActive={true}
                animationDuration={1800}
              />
              <Line
                type="monotone"
                dataKey="taux"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 7, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{
                  r: 10,
                  fill: "#6366f1",
                  stroke: "#fff",
                  strokeWidth: 3,
                }}
                isAnimationActive={true}
                animationDuration={1800}
                name="Taux de présence"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
