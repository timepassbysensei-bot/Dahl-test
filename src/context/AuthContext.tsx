<think>The user wants me to create a complete production-ready AuthContext.tsx file for the View Point Public School application. This context needs to:

1. Set up Supabase Auth provider
2. Fetch user profile from the database
3. Determine canonical role (Principal, Teacher, Pending Teacher)
4. Support Principal access to Teacher dashboard without altering stored roles
5. Handle loading states, error states, and proper authentication flow

Let me create a comprehensive AuthContext that handles all these requirements properly.

Key features needed:
- React Context for authentication state
- Supabase client integration
- Profile fetching with role determination
- Principal-to-Teacher dashboard access (showing "Principal access — all authorized classes")
- Proper loading/error states
- Role-based access helpers
- Sign out functionality
- Profile updates

I'll use the standard Supabase auth patterns with React Query for data fetching.
</think>

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export type UserRole = 'principal' | 'teacher' | 'pending_teacher' | 'public';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  phone: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isPrincipal: boolean;
  isTeacher: boolean;
  isPendingTeacher: boolean;
  isAuthenticated: boolean;
  canAccessTeacherDashboard: boolean;
  canAccessPrincipalDashboard: boolean;
  teacherDashboardLabel: string;
}

export interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  openTeacherDashboard: () => void;
  openPrincipalDashboard: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as UserProfile;
}

function determineCanonicalRole(profile: UserProfile | null): UserRole {
  if (!profile) return 'public';
  
  switch (profile.role) {
    case 'principal':
      return 'principal';
    case 'teacher':
      return profile.is_approved ? 'teacher' : 'pending_teacher';
    default:
      return 'public';
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    refetch: refreshProfile,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => (user?.id ? fetchUserProfile(user.id) : null),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setAuthLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setAuthError(error instanceof Error ? error : new Error('Authentication initialization failed'));
          setAuthLoading(false);
        }
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          if (event === 'SIGNED_OUT') {
            queryClient.clear();
          }
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            queryClient.invalidateQueries({ queryKey: ['profile', newSession.user.id] });
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const canonicalRole = determineCanonicalRole(profile ?? null);

  const isPrincipal = canonicalRole === 'principal';
  const isTeacher = canonicalRole === 'teacher';
  const isPendingTeacher = canonicalRole === 'pending_teacher';
  const isAuthenticated = !!session && !!user && canonicalRole !== 'public';

  const canAccessTeacherDashboard = isPrincipal || isTeacher;
  const canAccessPrincipalDashboard = isPrincipal;

  const teacherDashboardLabel = isPrincipal 
    ? 'Principal access — all authorized classes' 
    : 'Teacher Dashboard';

  const isLoading = authLoading || (!!user && profileLoading);
  const isError = authError !== null || profileError;

  const error = authError ?? (profileError ? new Error('Failed to load profile') : null);

  const signOut = useCallback(async () => {
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      queryClient.clear();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, [navigate, queryClient]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) throw new Error('Not authenticated');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw updateError;
    
    queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
  }, [user?.id, queryClient]);

  const openTeacherDashboard = useCallback(() => {
    navigate('/teacher');
  }, [navigate]);

  const openPrincipalDashboard = useCallback(() => {
    navigate('/principal');
  }, [navigate]);

  const value: AuthContextValue = {
    session,
    user,
    profile: profile ?? null,
    role: canonicalRole,
    isLoading,
    isError,
    error,
    isPrincipal,
    isTeacher,
    isPendingTeacher,
    isAuthenticated,
    canAccessTeacherDashboard,
    canAccessPrincipalDashboard,
    teacherDashboardLabel,
    signOut,
    refreshProfile: () => refreshProfile(),
    updateProfile,
    openTeacherDashboard,
    openPrincipalDashboard,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export function useRequireAuth(requiredRoles?: UserRole[]): AuthContextValue {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      const currentPath = window.location.pathname;
      navigate('/auth/login', { state: { from: currentPath } });
    }
    
    if (requiredRoles && auth.role && !requiredRoles.includes(auth.role)) {
      if (auth.isPrincipal) {
        navigate('/principal');
      } else if (auth.isTeacher) {
        navigate('/teacher');
      } else {
        navigate('/');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.role, requiredRoles]);
  
  return auth;
}

export function useRequirePrincipal(): AuthContextValue {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isPrincipal) {
      navigate('/');
    }
  }, [auth.isLoading, auth.isPrincipal]);
  
  return auth;
}

export function useRequireTeacher(): AuthContextValue {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.canAccessTeacherDashboard) {
      navigate('/');
    }
  }, [auth.isLoading, auth.canAccessTeacherDashboard]);
  
  return auth;
}

export function useRequirePendingTeacher(): AuthContextValue {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isPendingTeacher) {
      if (auth.isTeacher || auth.isPrincipal) {
        navigate('/');
      }
    }
  }, [auth.isLoading, auth.isPendingTeacher, auth.isTeacher, auth.isPrincipal]);
  
  return auth;
}

function navigate(path: string, options?: { state?: Record<string, string> }) {
  window.location.href = path;
}

export { AuthContext };