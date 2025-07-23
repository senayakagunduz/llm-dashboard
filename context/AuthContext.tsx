import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      setLoading(status === 'loading');
    }, [status]);
  
    const login = async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
  
      if (result?.error) {
        throw new Error('Invalid credentials');
      }
    };
  
    const logout = async () => {
      await signOut({ redirect: false });
    };
  
    const value = {
      isAuthenticated: !!session,
      user: session?.user,
      login,
      logout,
      loading,
    };
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
