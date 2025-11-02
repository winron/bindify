import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

const LoggerContext = createContext();

export const LoggerProvider = ({ children }) => {
  const [logger, setLogger] = useState([]);
  const [history, setHistory] = useState([]);
  const { logout } = useAuth();
  const successCodes = [200, 202, 204];

  const log = useCallback((data) => {
    setLogger(prev => [data, ...prev]);
    if (data?.trackData) {
      setHistory(prev => [data.trackData, ...prev]);
    }
    if (!successCodes.includes(data?.statusCode)) {
      logout();
    }
  }, [logout]);

  const setInitialHistory = useCallback((data) => {
    setHistory(prev => [...data.history, ...prev]);
  }, []);

  const resetHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const resetLogger = useCallback(() => {
    setLogger([]);
  }, []);

  const value = useMemo(
    () => ({
        logger,
        history,
        log,
        setInitialHistory,
        resetHistory,
        resetLogger
    }),
    [logger, history, log, setInitialHistory, resetHistory, resetLogger]
  );
  return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
};

export function useLogger() {
  return useContext(LoggerContext);
};
