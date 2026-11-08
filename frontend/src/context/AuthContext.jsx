import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on page load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user || data);
            setToken(storedToken);
          } else {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          console.error('[AuthContext] Session restore error:', error);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    const authToken = data.token;
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(data.user || { email });
    return data;
  };

  // Register handler (creates user and auto-logs in if token is returned)
const register = async (username, email, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      // Vérifie si la réponse est bien du JSON
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMsg = isJson ? (data.message || data.error) : `Error ${response.status}: ${data}`;
        throw new Error(errorMsg || 'Registration failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user || { email, username });
      }

      return data;
    } catch (error) {
      console.error('[AuthContext] Registration error:', error);
      throw error;
    }
  };
  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};