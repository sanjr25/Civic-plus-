'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '@/types/database';
import { isSupabaseConfigured, supabase } from './supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isStaff: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  isLoading: boolean;
  isSupabaseLive: boolean;
  switchRole: (role: UserRole) => void;
  login: (email: string, role?: UserRole) => Promise<void>;
  signup: (email: string, fullName: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const STORAGE_KEY_AUTH = 'civicpulse_auth_user_v1';

const DEFAULT_USERS: Record<UserRole, UserProfile> = {
  citizen: {
    id: 'usr-cit-101',
    email: 'elena.rostova@civicpulse.org',
    full_name: 'Elena Rostova',
    role: 'citizen',
    phone: '(206) 555-0182',
    notification_email: true,
    notification_sms: true,
    created_at: '2026-09-15T10:00:00Z',
  },
  staff: {
    id: 'usr-stf-201',
    email: 'marcus.vance@city.civicpulse.gov',
    full_name: 'Marcus Vance',
    role: 'staff',
    department: 'public_works',
    phone: '(206) 555-0914',
    notification_email: true,
    notification_sms: false,
    created_at: '2025-04-10T08:30:00Z',
  },
  admin: {
    id: 'usr-adm-301',
    email: 'director.patel@city.civicpulse.gov',
    full_name: 'Director Ananya Patel',
    role: 'admin',
    department: 'transportation',
    phone: '(206) 555-0800',
    notification_email: true,
    notification_sms: true,
    created_at: '2024-01-01T00:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);

  useEffect(() => {
    const live = isSupabaseConfigured();
    setIsSupabaseLive(live);

    if (live && supabase) {
      // Listen to Supabase Auth state changes
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Citizen',
            role: (session.user.user_metadata?.role as UserRole) || 'citizen',
            notification_email: true,
            notification_sms: false,
            created_at: session.user.created_at,
          };
          setUser(profile);
          setRole(profile.role);
        } else {
          loadStoredOrFallbackUser();
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const profile: UserProfile = {
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Citizen',
            role: (session.user.user_metadata?.role as UserRole) || 'citizen',
            notification_email: true,
            notification_sms: false,
            created_at: session.user.created_at,
          };
          setUser(profile);
          setRole(profile.role);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      loadStoredOrFallbackUser();
      setIsLoading(false);
    }
  }, []);

  function loadStoredOrFallbackUser() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setRole(parsed.role || 'citizen');
      } else {
        // Default demo persona: citizen
        const defaultUser = DEFAULT_USERS.citizen;
        setUser(defaultUser);
        setRole('citizen');
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(defaultUser));
      }
    } catch {
      setUser(DEFAULT_USERS.citizen);
      setRole('citizen');
    }
  }

  const switchRole = (newRole: UserRole) => {
    const targetUser = DEFAULT_USERS[newRole];
    setUser(targetUser);
    setRole(newRole);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(targetUser));
    } catch (e) {
      console.error(e);
    }
  };

  const login = async (email: string, requestedRole: UserRole = 'citizen') => {
    setIsLoading(true);
    if (isSupabaseLive && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) console.warn(error);
      } catch (err) {
        console.warn('Supabase signInWithOtp error:', err);
      }
    }
    // Set active user state
    const targetUser: UserProfile = {
      ...DEFAULT_USERS[requestedRole],
      email,
      full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: requestedRole,
    };
    setUser(targetUser);
    setRole(requestedRole);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(targetUser));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const signup = async (email: string, fullName: string, requestedRole: UserRole = 'citizen') => {
    setIsLoading(true);
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      role: requestedRole,
      department: requestedRole === 'staff' ? 'public_works' : undefined,
      notification_email: true,
      notification_sms: false,
      created_at: new Date().toISOString(),
    };
    setUser(newUser);
    setRole(requestedRole);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(newUser));
    } catch (e) {
      console.error(e);
    }
    setIsLoading(false);
  };

  const logout = async () => {
    if (isSupabaseLive && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    // Revert to demo guest or default citizen
    const citizenUser = DEFAULT_USERS.citizen;
    setUser(citizenUser);
    setRole('citizen');
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(citizenUser));
    } catch (e) {
      console.error(e);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    if (updates.role) setRole(updates.role);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isStaff: role === 'staff' || role === 'admin',
        isAdmin: role === 'admin',
        isCitizen: role === 'citizen',
        isLoading,
        isSupabaseLive,
        switchRole,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
