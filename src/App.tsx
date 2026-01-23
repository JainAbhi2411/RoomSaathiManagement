import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import AppLayout from '@/components/layouts/AppLayout';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import UpdateNotification from '@/components/UpdateNotification';

import routes from './routes';

import { AuthProvider } from '@/contexts/AuthContext';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Toaster } from '@/components/ui/toaster';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isPlanSelectionPage = location.pathname === '/plans';

  return (
    <>
      <IntersectObserver />
      {isLoginPage || isPlanSelectionPage ? (
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
        <AppLayout>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      )}
      <Toaster />
      <PWAInstallPrompt />
      <UpdateNotification />
    </>
  );
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <RouteGuard>
          <AppContent />
        </RouteGuard>
      </AuthProvider>
    </Router>
  );
};

export default App;
