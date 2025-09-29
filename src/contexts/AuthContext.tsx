'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, UserRole } from '@/models/types';
import { onAuthStateChange, getUserProfile, signOutUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  isOperator: () => boolean;
  canAccess: (requiredRole: UserRole) => boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser);

      if (authUser) {
        // Get user profile from Firestore
        const profile = await getUserProfile(authUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = (): boolean => {
    return userProfile?.role === 'admin';
  };

  const isOperator = (): boolean => {
    return userProfile?.role === 'operator';
  };

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!userProfile) return false;
    if (requiredRole === 'admin') return userProfile.role === 'admin';
    if (requiredRole === 'operator') return userProfile.role === 'operator' || userProfile.role === 'admin';
    return false;
  };

  const refreshUserProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signOut: handleSignOut,
    isAdmin,
    isOperator,
    canAccess,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
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