import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import UpperBar from './components/UpperBar';

import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Events from './pages/Events';
import Graphs from './pages/Graphs';
import Notification from './pages/Notification';


const isAuthenticated = () => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();
  const showUpperBar = isAuthenticated() && location.pathname !== '/login';

  return (
    <div className="min-h-screen bg-gray-100">
      {showUpperBar && <UpperBar />}

      <div>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notification />
              </ProtectedRoute>
            }
          />


          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route
            path="/graphs"
            element={
              <ProtectedRoute>
                <Graphs />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;