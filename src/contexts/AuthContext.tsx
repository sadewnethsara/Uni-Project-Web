"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
}

interface UserHistory {
  id: string;
  date: string;
  action: string;
  details: string;
  category: 'market' | 'analyze' | 'settings';
}

interface NotificationSettings {
  email: boolean;
  marketing: boolean;
  mobile: boolean;
  updates: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, role: string, phone?: string) => Promise<void>;
  logout: () => void;
  userHistory: UserHistory[];
  addToHistory: (action: string, details: string, category: 'market' | 'analyze' | 'settings') => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
      } catch (err) {
        console.warn("Failed to load user state:", err);
      }
    }
    return null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!user);
  const [isInitialized, setIsInitialized] = useState(false);

  const [userHistory, setUserHistory] = useState<UserHistory[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedHistory = localStorage.getItem('userHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
      } catch (err) {
        console.warn("Failed to load history state:", err);
      }
    }
    return [];
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    const defaults = { email: true, marketing: false, mobile: true, updates: true };
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem('notificationSettings');
        return savedSettings ? JSON.parse(savedSettings) : defaults;
      } catch (err) {
        console.warn("Failed to load notification settings:", err);
      }
    }
    return defaults;
  });

  const supabase = createClient();

  // Sync userHistory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userHistory', JSON.stringify(userHistory));
  }, [userHistory]);

  // Auth state change handler
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch or create profile
        const { data: profile, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const newUser: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role || 'viewer',
            phone: profile.phone || undefined,
          };
          setUser(newUser);
          setIsLoggedIn(true);
          localStorage.setItem('user', JSON.stringify(newUser));
        } else {
          // Provision a new profile for OAuth users
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
          const email = session.user.email!;
          const newUser: User = {
            id: session.user.id,
            email,
            name,
            role: 'viewer',
          };
          
          await supabase.from('admins').insert([{
            id: session.user.id,
            email,
            name,
            role: 'viewer',
            password_hash: '',
            is_active: true
          }]);

          setUser(newUser);
          setIsLoggedIn(true);
          localStorage.setItem('user', JSON.stringify(newUser));
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('user');
      }
      setIsInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Add login to history
      const loginEntry: UserHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        action: 'Login',
        details: 'User logged in successfully with email',
        category: 'settings'
      };
      setUserHistory(prev => [loginEntry, ...prev]);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        // Map UI roles (buyer, farmer, trader) to allowed database roles (super, market, viewer)
        const dbRole = (role === 'super' || role === 'market' || role === 'viewer') ? role : 'viewer';

        // Create user profile in public.admins
        const { error: profileError } = await supabase.from('admins').insert([{
          id: data.user.id,
          email,
          name,
          role: dbRole,
          password_hash: '', // Handled by Supabase Auth
          is_active: true
        }]);

        if (profileError) {
          console.error("Failed to insert profile record:", profileError);
          throw new Error(profileError.message || "Failed to create user profile database record.");
        }
      }

      // Add registration to history
      const registerEntry: UserHistory = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        action: 'Registration',
        details: 'New user account created via email signup',
        category: 'settings'
      };
      setUserHistory(prev => [registerEntry, ...prev]);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    // Add logout to history before clearing
    const logoutEntry: UserHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action: 'Logout',
      details: 'User logged out',
      category: 'settings'
    };
    setUserHistory(prev => [logoutEntry, ...prev]);

    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
  }, []);

  const addToHistory = useCallback((action: string, details: string, category: 'market' | 'analyze' | 'settings') => {
    if (!isLoggedIn) return;

    const newEntry: UserHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action,
      details,
      category
    };

    setUserHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
  }, [isLoggedIn]);

  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, ...settings };
      localStorage.setItem('notificationSettings', JSON.stringify(updated));
      return updated;
    });

    if (isLoggedIn) {
      addToHistory('Settings Updated', `Notification settings changed: ${JSON.stringify(settings)}`, 'settings');
    }
  }, [isLoggedIn, addToHistory]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn,
      isInitialized,
      login,
      loginWithGoogle,
      register,
      logout,
      userHistory,
      addToHistory,
      notificationSettings,
      updateNotificationSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}