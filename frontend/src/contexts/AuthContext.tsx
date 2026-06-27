import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  email: string;
  role: 'ALUNO' | 'SERVIDOR';
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = !!user;

  async function login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });

      const { user, token } = response.data;

      await AsyncStorage.setItem('@AppRefeitorio:token', token);
      await AsyncStorage.setItem('@AppRefeitorio:user', JSON.stringify(user));

      setUser(user);

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error; 
    }
  }

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);