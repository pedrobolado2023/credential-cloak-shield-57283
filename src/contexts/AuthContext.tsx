import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: number;
  email: string;
  nome: string;
  tipo: string;
  hoteis: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth-login', {
        body: { email, senha }
      });

      if (error) throw error;

      if (data.success) {
        const userData = data.user;
        setUser(userData);
        sessionStorage.setItem('user', JSON.stringify(userData));
        sessionStorage.setItem('email', email);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao fazer login' };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('email');
  };

  const isAdmin = user?.tipo === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
