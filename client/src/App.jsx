import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Management from './pages/admin/Management';
import AppLayout from './components/layout/AppLayout';
import { NotificationProvider } from './context/NotificationContext';
import AdminLayout from './components/layout/AdminLayout';
import ChefLayout from './components/layout/ChefLayout';
import Contact from './pages/Contact';
import EmploiDuTemps from './pages/admin/EmploiDuTemps';
import Pedagogie from './pages/admin/Pedagogie';
import CoursManagement from './components/admin/pedagogie/CoursManagement';
import ChefDashboard from './pages/chef/Dashboard';
import ChefEmploiDuTemps from './pages/chef/EmploiDuTemps';
import ChefPresences from './pages/chef/Presences';
import ChefFeedback from './pages/chef/Feedback';
import ChefNotifications from './pages/chef/Notifications';
import MaClasse from './pages/chef/MaClasse';
import ConfirmationPresences from './pages/chef/ConfirmationPresences';
import AdminPresences from './pages/admin/Presences';
import AdminFeedback from './pages/admin/Feedback';
import AdminNotifications from './pages/admin/Notifications';
import AdminSettings from './pages/admin/Settings';
import ForgotPassword from './pages/admin/ForgotPassword';
import ResetPassword from './pages/admin/ResetPassword';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  // Charger le thème sauvegardé au démarrage de l'app
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/about" element={<AppLayout><About /></AppLayout>} />
          <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
          <Route path="/login" element={<AppLayout><Login /></AppLayout>} />
          
          {/* NOUVELLES ROUTES pour la récupération de mot de passe */}
          <Route path="/admin/forgot-password" element={<AppLayout><ForgotPassword /></AppLayout>} />
          <Route path="/admin/reset-password/:token" element={<AppLayout><ResetPassword /></AppLayout>} />

          {/* Espace admin avec sidebar */}
          <Route
            path="/admin/*"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="management" element={<Management />} />
            <Route path="cours" element={<CoursManagement />} />
            <Route path="schedules" element={<EmploiDuTemps />} />
            <Route path="pedagogie" element={<Pedagogie />} />
            <Route path="attendance" element={<AdminPresences />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Espace chef de classe avec sidebar */}
          <Route
            path="/chef/*"
            element={
              <PrivateRoute role="chef">
                <ChefLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<ChefDashboard />} />
            <Route path="emploi-temps" element={<ChefEmploiDuTemps />} />
            <Route path="presences" element={<ChefPresences />} />
            <Route path="feedback" element={<ChefFeedback />} />
            <Route path="notifications" element={<ChefNotifications />} />
            <Route path="ma-classe" element={<MaClasse />} />
            <Route path="validation-presences" element={<ConfirmationPresences />} />
            
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;