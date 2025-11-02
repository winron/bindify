import { createContext, useContext, useMemo, useState, useCallback } from 'react';
const ShortcutsContext = createContext();

export const ShortcutsProvider = ({ children }) => {
  const [shortcuts, setShortcuts] = useState({});

  const setInitialShortcuts = useCallback((data) => {
    setShortcuts(data);
  }, []);

  const value = useMemo(
    () => ({
        shortcuts,
      setInitialShortcuts,
    }),
    [shortcuts, setInitialShortcuts]
  );
  return <ShortcutsContext.Provider value={value}>{children}</ShortcutsContext.Provider>;
};

export function useShortcuts() {
  return useContext(ShortcutsContext);
};
