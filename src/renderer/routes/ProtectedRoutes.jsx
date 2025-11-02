import { useEffect, useCallback } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useShortcuts } from '../hooks/useShortcuts';
import { useLogger } from '../hooks/useLogger';
import Navbar from '../components/Navbar';

export default function ProtectedRoutes() {
  const { user, setProfile } = useAuth();
  const { setInitialShortcuts } = useShortcuts();
  const { log, setInitialHistory, resetHistory, resetLogger } = useLogger();

  useEffect(() => {
    window.api.send('to-main', { channel: 'get-profile' });
    window.api.send('to-main', { channel: 'get-shortcuts' });
    
    const handleSetShortcuts = (evt, data) => {
      setInitialShortcuts(data);
    };
    
    const handleSetLogger = (evt, data) => {
      log(data);
    };
    
    const handleSetProfileAndHistory = (evt, data) => {
      setProfile(data);
      setInitialHistory(data);
    };
    
    const handleClearAllData = () => {
      // Clear in-memory logger and history state
      resetHistory();
      resetLogger();
      // Reload shortcuts to get fresh initial state
      window.api.send('to-main', { channel: 'get-shortcuts' });
    };
    
    window.api.handle('set-shortcuts', handleSetShortcuts);
    window.api.handle('set-logger', handleSetLogger);
    window.api.handle('set-profile-and-history', handleSetProfileAndHistory);
    window.api.handle('clear-all-data-complete', handleClearAllData);
    
    return () => {
      window.api.removeListener('set-shortcuts', handleSetShortcuts);
      window.api.removeListener('set-logger', handleSetLogger);
      window.api.removeListener('set-profile-and-history', handleSetProfileAndHistory);
      window.api.removeListener('clear-all-data-complete', handleClearAllData);
    };
  }, [setInitialShortcuts, log, setProfile, setInitialHistory, resetHistory, resetLogger]);

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
      <Navbar isProtected={true} />
      <Outlet />
    </div>
  );
}
