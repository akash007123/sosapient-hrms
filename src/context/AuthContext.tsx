import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'employee';
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app load
    const storedToken = localStorage.getItem('hrms_token');
    const storedUser = localStorage.getItem('hrms_user');
    
    console.log('AuthContext: Checking stored credentials');
    console.log('Stored token:', storedToken ? 'Present' : 'Missing');
    console.log('Stored user:', storedUser ? 'Present' : 'Missing');
    
    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(userData);
      // Also set userRole and userId for compatibility with Reports component
      localStorage.setItem('userRole', userData.role);
      localStorage.setItem('userId', userData.id);
      console.log('AuthContext: Restored user session:', userData.email);
    } else {
      console.log('AuthContext: No stored credentials found');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthContext: Attempting login to:', `${import.meta.env.VITE_BASE_URL}/api/auth/login`);
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('AuthContext: Login response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Login response data:', data); // Debug log
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('hrms_token', data.token);
        localStorage.setItem('hrms_user', JSON.stringify(data.user));
        // Also set userRole and userId for compatibility with Reports component
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userId', data.user.id);
        console.log('AuthContext: Set localStorage userRole:', data.user.role); // Debug log
        console.log('AuthContext: Set localStorage userId:', data.user.id); // Debug log
        return true;
      } else {
        const error = await response.json();
        console.log('AuthContext: Login failed:', error);
        alert(error.message || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      alert('Login failed. Please try again.');
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      // Check if userData is FormData (for file uploads) or regular object
      const isFormData = userData instanceof FormData;
      
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: isFormData ? {} : {
          'Content-Type': 'application/json',
        },
        body: isFormData ? userData : JSON.stringify(userData),
      });

      if (response.ok) {
        alert('Signup successful! Please login.');
        return true;
      } else {
        const error = await response.json();
        alert(error.message || 'Signup failed');
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup failed. Please try again.');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hrms_token');
    localStorage.removeItem('hrms_user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    signup,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 