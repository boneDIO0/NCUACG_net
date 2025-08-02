/*這個是用來測試登入狀態的，等接後端時會修改或刪除*/ 
import { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react';
interface User {
  id: number;
  username: string;
  role: 'admin' | 'member' | 'guest';
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    if (window.confirm('確定要登出嗎？')) {
      alert('您已成功登出');
      setUser(null);
    }
    
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user
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
