import React, { createContext, useState, useEffect, useCallback } from 'react';
import { API_URL } from './config/api';

// Create Context
export const AuthContext = createContext(null);

// AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ================================
  // 🔄 Load user từ localStorage khi app khởi động
  // ================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        const savedUserData = localStorage.getItem('userData');

        if (savedToken && savedUserData) {
          const userData = JSON.parse(savedUserData);
          console.log('✅ Load user từ localStorage:', userData);
          
          setToken(savedToken);
          setCurrentUser(userData);
          setIsAuthenticated(true);

          // Verify token
          await verifyToken(savedToken);
        }
      } catch (error) {
        console.error('❌ Init auth error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ================================
  // 🔐 Verify token với server
  // ================================
  const verifyToken = async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Token không hợp lệ, đăng xuất...');
        logout();
        return false;
      }

      const data = await response.json();
      console.log('✅ Token hợp lệ:', data);
      return true;
    } catch (error) {
      console.error('❌ Verify token error:', error);
      return false;
    }
  };

  // ================================
  // 🌐 Login
  // ================================
  const login = useCallback((userData, authToken) => {
    console.log('✅ Login success:', { userData, authToken });
    
    setCurrentUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    
    localStorage.setItem('token', authToken);
    localStorage.setItem('userData', JSON.stringify(userData));
  }, []);

  // ================================
  // 🚪 Logout
  // ================================
  const logout = useCallback(() => {
    console.log('🚪 Đăng xuất...');
    
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }, []);

  // ================================
  // ✏️ Update user info
  // ================================
  const updateUser = useCallback((updatedUser) => {
    console.log('✅ Update user:', updatedUser);
    
    setCurrentUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  }, []);

  // Context value
  const value = {
    currentUser,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};