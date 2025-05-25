import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import AdminNavbar from './AdminNavbar';
import ChefNavbar from './ChefNavbar';

const adminRoutes = ['/admin/dashboard', '/admin/schedules', '/admin/attendance', '/admin/feedback', '/admin/notifications', '/admin/management'];
const chefRoutes = ['/chef/dashboard', '/chef/schedule', '/chef/attendance', '/chef/feedback', '/chef/notifications'];

export default function AppLayout({ children }) {
  const location = useLocation();
  let navbarToShow = <Navbar />;

  if (adminRoutes.some(route => location.pathname.startsWith(route))) {
    navbarToShow = <AdminNavbar />;
  } else if (chefRoutes.some(route => location.pathname.startsWith(route))) {
    navbarToShow = <ChefNavbar />;
  }

  return (
    <>
      {navbarToShow}
      {children}
    </>
  );
}
