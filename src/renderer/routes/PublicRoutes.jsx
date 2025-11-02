import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';

export default function PublicRoutes() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/shortcuts" />;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
      <Navbar isProtected={false} />
      <Outlet />
    </div>
  );
}
