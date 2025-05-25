import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Management from './pages/admin/Management';
import ChefDashboard from './pages/chef/Dashboard';
import ProfDashboard from './pages/prof/Dashboard';
import AppLayout from './components/layout/AppLayout';
import { NotificationProvider } from './context/NotificationContext';
import AdminLayout from './components/layout/AdminLayout';
import ChefLayout from './components/layout/ChefLayout';
import ProfLayout from './components/layout/ProfLayout';
import Contact from './pages/Contact';
import EmploiDuTemps from './pages/admin/EmploiDuTemps';

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
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<AppLayout><Home /></AppLayout>} />
          <Route path="/about" element={<AppLayout><About /></AppLayout>} />
          <Route path="/contact" element={<AppLayout><Contact /></AppLayout>} />
          <Route path="/login" element={<AppLayout><Login /></AppLayout>} />

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
            <Route path="schedules" element={<EmploiDuTemps />} />
            {/* Autres routes admin */}
          </Route>

          {/* Espace professeur avec sidebar */}
          <Route
            path="/prof/*"
            element={
              <PrivateRoute role="prof">
                <ProfLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<ProfDashboard />} />
            {/* Autres routes prof */}
          </Route>

          {/* Espace chef avec sidebar */}
          <Route
            path="/chef/*"
            element={
              <PrivateRoute role="chef">
                <ChefLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<ChefDashboard />} />
            {/* Autres routes chef */}
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;