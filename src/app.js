import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './renderer/hooks/useAuth';
import { LoggerProvider } from './renderer/hooks/useLogger';
import { ShortcutsProvider } from './renderer/hooks/useShortcuts';
import { PublicRoutes, ProtectedRoutes } from './renderer/routes';
import { Home, Profile, Shortcuts, History, Logs } from './renderer/screens';
import './renderer/styles/appStyles.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <LoggerProvider>
          <ShortcutsProvider>
            <Routes>
              <Route element={<PublicRoutes />}>
                <Route path="/" element={<Home />} />
                <Route path="/public-logs" element={<Logs />} />
              </Route>

              <Route element={<ProtectedRoutes />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/shortcuts" element={<Shortcuts />} />
                <Route path="/history" element={<History />} />
                <Route path="/protected-logs" element={<Logs />} />
              </Route>
            </Routes>
          </ShortcutsProvider>
        </LoggerProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
