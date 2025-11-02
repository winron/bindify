import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import  useLocalStorage from './useLocalStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('user', null);
  const [id, setId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const navigate = useNavigate();

  // call this function when you want to authenticate the user
  const login = useCallback(async (data) => {
    setUser(data);
    navigate('/shortcuts');
  }, [setUser, navigate]);

  // call this function to sign out logged in user
  const logout = useCallback(() => {
    setUser(null);
    navigate('/', { replace: true });
  }, [setUser, navigate]);

  const setProfile = useCallback((data) => {
    setId(data.id);
    setDisplayName(data.displayName);
  }, []);

  const value = useMemo(
    () => ({
      user,
      id,
      displayName,
      login,
      logout,
      setProfile
    }),
    [user, id, displayName, login, logout, setProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  return useContext(AuthContext);
};
