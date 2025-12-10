import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    let userData = null;

    if (email === 'user@demo.com' && password === 'password123') {
      userData = { 
        name: 'Demo User', 
        email: email, 
        role: 'USER' 
      };
    } else if (email === 'admin@demo.com' && password === 'admin123') {
      userData = { 
        name: 'Admin User', 
        email: email, 
        role: 'ADMIN' 
      };
    } else {
      return { 
        success: false, 
        error: 'Wrong email or password!' 
      };
    }

    // Save to state and localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true };
  };

  const signup = (name, email, password, role = 'USER') => {
    const userData = { name, email, role };
    
    // Save to state and localStorage
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};