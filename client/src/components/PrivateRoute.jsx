import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (role === 'admin' && user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  if (role === 'chef' && user.role !== 'chef') {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
