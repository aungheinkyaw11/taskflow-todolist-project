// =====================================================
//  frontend/src/main.jsx  (updated with router + auth)
// =====================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import App      from './App.jsx';
import Login    from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter enables URL routing */}
    <BrowserRouter>
      {/* AuthProvider makes login state available everywhere */}
      <AuthProvider>
        <Routes>
          {/* Public routes — anyone can visit */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route — must be logged in */}
          <Route path="/" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          } />

          {/* Catch all — redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);