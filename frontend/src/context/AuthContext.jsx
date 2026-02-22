// =====================================================
//  frontend/src/context/AuthContext.jsx
//
//  This is a "Context" — it shares login state
//  across ALL components without passing props manually.
//
//  Think of it like a global variable that any
//  component can read or update.
//
//  PROVIDES:
//  - user       → the logged-in user object (or null)
//  - token      → the JWT token string
//  - login()    → saves user + token after login
//  - logout()   → clears user + token
//  - isLoading  → true while checking if user is logged in
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react';

// Create the context object
const AuthContext = createContext(null);

// AuthProvider wraps your whole app and provides auth state
export function AuthProvider({ children }) {
  const [user,      setUser]      = useState(null);
  const [token,     setToken]     = useState(null);
  const [isLoading, setIsLoading] = useState(true); // checking localStorage on startup

  // On app load — check if user was already logged in
  // (token saved in localStorage persists across page refreshes)
  useEffect(() => {
    const savedToken = localStorage.getItem('taskflow_token');
    const savedUser  = localStorage.getItem('taskflow_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Called after successful login or register
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    // Save to localStorage so user stays logged in after refresh
    localStorage.setItem('taskflow_token', jwtToken);
    localStorage.setItem('taskflow_user',  JSON.stringify(userData));
  };

  // Called when user clicks logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any component can call useAuth() to get auth state
// Example: const { user, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}