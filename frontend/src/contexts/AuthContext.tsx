// AuthContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  role: 'superadmin' | 'admin' | 'member' | 'guest';
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // App 初始化時檢查是否已登入
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get<User>('http://127.0.0.1:8000/api/me/', {
          withCredentials: true,
        });
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  const logout = async () => {
    if (window.confirm('確定要登出嗎？')) {
      try {
        await axios.post(
          'http://127.0.0.1:8000/api/logout/',
          {},
          { withCredentials: true }
        );
      } catch {
        // 後端沒做 logout 也沒關係
      } finally {
        setUser(null);
        alert('您已成功登出');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必須在 AuthProvider 裡面使用');
  }
  return context;
};

export type { User };