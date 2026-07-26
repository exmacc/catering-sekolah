'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: (User & { customer?: { customer_type: string; child_name?: string; child_class?: string } }) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => subscription?.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await fetchUser(session.user.id);
    }
    setLoading(false);
  }

  async function fetchUser(userId: string) {
    const { data: userData } = await supabase
      .from('users')
      .select('*, customer:customers(*)')
      .eq('id', userId)
      .single();
    if (userData) {
      setUser(userData as any);
      return userData as any;
    }
    // fallback if RLS blocks: use auth metadata
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const fallback = {
        id: authUser.id,
        email: authUser.email || '',
        full_name: authUser.user_metadata?.full_name || authUser.email || 'User',
        role: authUser.user_metadata?.role || 'customer',
        is_active: true,
        created_at: authUser.created_at,
        updated_at: authUser.created_at,
      };
      setUser(fallback as any);
      return fallback;
    }
    return null;
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    if (data.user) await fetchUser(data.user.id);
    return { success: true };
  }

  async function register(data: any) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.success) return { success: false, error: result.error };
    await login(data.email, data.password);
    return { success: true };
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
