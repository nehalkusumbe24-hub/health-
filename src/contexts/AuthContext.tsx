import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || '';

export type User = {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role?: string;
};

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const res = await fetch(`${API_URL}/api/data/profiles/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signInWithPhone: (phone: string) => Promise<{ error: Error | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) { setProfile(null); return; }
    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
        getProfile(u.id).then(setProfile);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log(`[Auth] Attempting login to: ${API_URL}/auth/login`);
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server returned non-JSON response from ${API_URL}/auth/login. Status: ${res.status}`);
      }

      if (!res.ok) throw new Error(data.error || data.message || `Login failed with status ${res.status}`);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      getProfile(data.user.id).then(setProfile);
      return { error: null };
    } catch (error) {
      console.error('[Auth] Login error:', error);
      alert(`Login Error connecting to ${API_URL || '(relative URL)'}/auth/login: ${(error as Error).message}`);
      return { error: error as Error };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      console.log(`[Auth] Attempting signup to: ${API_URL}/auth/signup`);
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName || '' })
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server returned non-JSON response from ${API_URL}/auth/signup. Status: ${res.status}`);
      }

      if (!res.ok) throw new Error(data.error || data.message || `Signup failed with status ${res.status}`);
      return { error: null };
    } catch (error) {
      console.error('[Auth] Signup error:', error);
      alert(`Signup Error connecting to ${API_URL || '(relative URL)'}/auth/signup: ${(error as Error).message}`);
      return { error: error as Error };
    }
  };

  const signInWithPhone = async (_phone: string) => {
    return { error: new Error('Phone login is not available. Please use email login.') };
  };

  const verifyOtp = async (_phone: string, _token: string) => {
    return { error: new Error('OTP verification is not available.') };
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithEmail, signUpWithEmail,
      signInWithPhone, verifyOtp,
      signOut, refreshProfile
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
