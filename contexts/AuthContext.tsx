import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Simulate checking stored auth
      const storedUser = null; // Replace with actual storage check
      if (storedUser) {
        setUser(storedUser);
        router.replace('/(tabs)');
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.replace('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: '1',
        email,
        name: email.split('@')[0],
      };
      
      setUser(newUser);
      router.replace('/profile-setup');
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // Simulate register API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
        id: '1',
        email,
        name,
      };
      
      setUser(newUser);
      router.replace('/profile-setup');
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    router.replace('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};