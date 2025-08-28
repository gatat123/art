import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Check if it's an admin token
      if (token.startsWith('admin-token-')) {
        setUser({
          id: 'admin-user',
          username: 'HSG202',
          email: 'admin@studio.com',
          isAdmin: true
        } as any);
        setLoading(false);
        return;
      }
      
      // Check if it's a demo token
      if (token.startsWith('demo-token-')) {
        setUser({
          id: 'demo-user',
          username: 'demo',
          email: 'demo@example.com'
        });
        setLoading(false);
        return;
      }

      const response = await axios.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('auth-token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    // Admin account handling
    if (username === 'HSG202' && password === '1004mobil!#') {
      const adminUser = {
        id: 'admin-user',
        username: 'HSG202',
        email: 'admin@studio.com',
        isAdmin: true
      };
      
      const token = 'admin-token-' + Date.now();
      localStorage.setItem('auth-token', token);
      localStorage.setItem('user-role', 'admin');
      document.cookie = `auth-token=${token}; path=/`;
      setUser(adminUser as any);
      
      router.push('/studio');
      return;
    }
    
    // Demo account handling
    if (username === 'demo' && password === 'demo123') {
      const demoUser = {
        id: 'demo-user',
        username: 'demo',
        email: 'demo@example.com'
      };
      
      const token = 'demo-token-' + Date.now();
      localStorage.setItem('auth-token', token);
      document.cookie = `auth-token=${token}; path=/`;
      setUser(demoUser);
      
      router.push('/studio');
      return;
    }
    
    // Regular API login
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('auth-token', token);
      document.cookie = `auth-token=${token}; path=/`;
      setUser(user);
      
      router.push('/studio');
    } catch (error) {
      throw new Error('로그인에 실패했습니다');
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    // Demo signup (client-side only)
    const demoUser = {
      id: 'user-' + Date.now(),
      username: username,
      email: email
    };
    
    const token = 'demo-token-' + Date.now();
    localStorage.setItem('auth-token', token);
    document.cookie = `auth-token=${token}; path=/`;
    setUser(demoUser);
    
    router.push('/studio');
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
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