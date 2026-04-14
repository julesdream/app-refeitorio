import React, { createContext, useState, useContext } from 'react';

// Definição do tipo de usuário conforme os requisitos
interface User {
  login: string;
  tipo: 'aluno' | 'servidor';
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

  const login = (email: string, pass: string) => {
    // Simulação de base de dados para teste
    const mockUsers = [
      { login: 'aluno@if.com', pwd: '123', tipo: 'aluno' },
      { login: 'servidor@if.com', pwd: '123', tipo: 'servidor' }
    ];

    const foundUser = mockUsers.find(u => u.login === email && u.pwd === pass);

    if (foundUser) {
      setUser({ login: foundUser.login, tipo: foundUser.tipo as 'aluno' | 'servidor' });
    } else {
      alert("Credenciais inválidas! Tente aluno@if.com / 123");
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);