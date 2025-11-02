import { useCallback, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

export default function Home() {
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthorized = (evt, data) => {
      login(data);
    };

    window.api.handle('handle-spotify-authorized', handleAuthorized);

    return () => {
      window.api.removeListener('handle-spotify-authorized', handleAuthorized);
    };
  }, [login]);

  const handleLogin = useCallback(() => {
    window.api.send('to-main', { channel: 'start-spotify-authorization' });
  }, []);

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%', 
      gap: '24px',
      padding: '24px'
    }}>
      <h1 style={{
        color: '#ffffff',
        fontSize: '48px',
        fontWeight: 900,
        letterSpacing: '-0.04em',
        margin: 0,
        textAlign: 'center'
      }}>
        Bindify
      </h1>
      <p style={{
        color: '#b3b3b3',
        fontSize: '16px',
        fontWeight: 400,
        textAlign: 'center',
        margin: 0
      }}>
        Control your Spotify playback with customizable keyboard shortcuts
      </p>
      <Button onClick={() => handleLogin()}>Login to Spotify</Button>
    </div>
  );
}

