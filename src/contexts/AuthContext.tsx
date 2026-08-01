"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
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
  login: (email: string, password: string) => void;
  logout: () => void;
  userHistory: UserHistory[];
  addToHistory: (action: string, details: string, category: 'market' | 'analyze' | 'settings') => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userHistory, setUserHistory] = useState<UserHistory[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    marketing: false,
    mobile: true,
    updates: true
  });

  // Load persisted data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedHistory = localStorage.getItem('userHistory');
    const savedSettings = localStorage.getItem('notificationSettings');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    if (savedHistory) {
      setUserHistory(JSON.parse(savedHistory));
    }

    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Sync userHistory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userHistory', JSON.stringify(userHistory));
  }, [userHistory]);

  const login = useCallback((email: string, password: string) => {
    // Simulate login - in production, this would call an API
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      avatar: undefined
    };

    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Add login to history
    const loginEntry: UserHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action: 'Login',
      details: 'User logged in successfully',
      category: 'settings'
    };
    setUserHistory(prev => [loginEntry, ...prev]);
  }, []);

  const logout = useCallback(() => {
    // Add logout to history before clearing
    const logoutEntry: UserHistory = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      action: 'Logout',
      details: 'User logged out',
      category: 'settings'
    };
    setUserHistory(prev => [logoutEntry, ...prev]);

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
      login,
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