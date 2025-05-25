import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Management from './pages/admin/Management';
import AppLayout from './components/layout/AppLayout';
import { NotificationProvider } from './context/NotificationContext';
import AdminLayout from './components/layout/AdminLayout';
import Contact from './pages/Contact';
import EmploiDuTemps from './pages/admin/EmploiDuTemps';
import Pedagogie from './pages/admin/Pedagogie';
import CoursManagement from './components/admin/pedagogie/CoursManagement';

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
            <Route path="cours" element={<CoursManagement />} />
            <Route path="schedules" element={<EmploiDuTemps />} />
            <Route path="pedagogie" element={<Pedagogie />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;