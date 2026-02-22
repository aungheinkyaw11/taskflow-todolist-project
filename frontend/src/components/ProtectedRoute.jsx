// =====================================================
//  frontend/src/components/ProtectedRoute.jsx
//
//  Wraps pages that require login.
//  If user is NOT logged in → redirect to /login
//  If user IS logged in     → show the page normally
//
//  USAGE in main.jsx:
//  <ProtectedRoute>
//    <App />          ← only shown if logged in
//  </ProtectedRoute>
// =====================================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  // Still checking localStorage — show loading spinner
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', fontSize: 16, color: '#94a3b8',
      }}>
        Loading…
      </div>
    );
  }

  // Not logged in → redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → show the protected page
  return children;
}