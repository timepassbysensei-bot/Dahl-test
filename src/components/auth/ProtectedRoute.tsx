import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { UserRole } from '@/types';
import { AlertTriangle, Loader2, ShieldOff } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  requireAuth?: boolean;
}

type AccessLevel = 'full' | 'principal_override' | 'none';

function getAccessLevel(
  userRole: UserRole | null,
  allowedRoles: UserRole[]
): AccessLevel {
  if (!userRole) return 'none';
  
  if (allowedRoles.includes(userRole)) {
    return 'full';
  }
  
  if (userRole === UserRole.PRINCIPAL && allowedRoles.includes(UserRole.TEACHER)) {
    return 'principal_override';
  }
  
  return 'none';
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    </div>
  );
}

function AccessDeniedState({ 
  userRole, 
  requiredRoles 
}: { 
  userRole: UserRole | null; 
  requiredRoles: UserRole[];
}) {
  const location = useLocation();
  
  const getMessage = () => {
    if (!userRole) {
      return 'Please sign in to access this page.';
    }
    
    if (userRole === UserRole.PENDING_TEACHER) {
      return 'Your teacher registration is pending approval. Please wait for the Principal to review your application.';
    }
    
    return 'You do not have permission to access this page. Please contact the administrator if you believe this is an error.';
  };
  
  const getRedirectPath = () => {
    if (!userRole) {
      return '/teacher/login';
    }
    
    if (userRole === UserRole.PENDING_TEACHER) {
      return '/teacher/pending';
    }
    
    if (userRole === UserRole.PRINCIPAL) {
      return '/principal/dashboard';
    }
    
    if (userRole === UserRole.TEACHER) {
      return '/teacher/dashboard';
    }
    
    return '/';
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <ShieldOff className="h-8 w-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Access Restricted
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {getMessage()}
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-slate-600 mb-1">
              <span className="font-medium">Current role:</span>{' '}
              <span className="capitalize">
                {userRole?.replace('_', ' ').toLowerCase() || 'Not signed in'}
              </span>
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Required roles:</span>{' '}
              {requiredRoles.map(r => r.replace('_', ' ')).join(', ')}
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.href = getRedirectPath()}
              className="w-full px-4 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrincipalAccessBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">Principal access — all authorized classes</span>
          {' '}You are viewing the Teacher dashboard with full administrative access.
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireAuth = true
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoading = authLoading || profileLoading || !mounted;

  if (isLoading) {
    return <LoadingState />;
  }

  if (requireAuth && !user) {
    return (
      <Navigate
        to="/teacher/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/teacher/login"
        state={{ from: location }}
        replace
      />
    );
  }

  const userRole = profile?.role as UserRole | null;
  const accessLevel = getAccessLevel(userRole, allowedRoles);

  if (accessLevel === 'none') {
    return (
      <AccessDeniedState
        userRole={userRole}
        requiredRoles={allowedRoles}
      />
    );
  }

  if (accessLevel === 'principal_override') {
    return (
      <>
        <PrincipalAccessBanner />
        {children}
      </>
    );
  }

  return <>{children}</>;
}

export function withPrincipalAccess<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[] = [UserRole.TEACHER]
) {
  return function PrincipalWrappedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

export function useRequireAuth() {
  const { user, isLoading } = useAuth();
  const { profile } = useProfile();
  
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    profile,
    userRole: profile?.role as UserRole | null,
    isPrincipal: profile?.role === UserRole.PRINCIPAL,
    isTeacher: profile?.role === UserRole.TEACHER,
    isPendingTeacher: profile?.role === UserRole.PENDING_TEACHER,
  };
}

export function useRequireRole(allowedRoles: UserRole[]) {
  const { userRole, isLoading } = useRequireAuth();
  
  const hasAccess = userRole ? allowedRoles.includes(userRole) : false;
  const isPrincipalWithAccess = userRole === UserRole.PRINCIPAL && allowedRoles.includes(UserRole.TEACHER);
  
  return {
    isLoading,
    hasAccess: hasAccess || isPrincipalWithAccess,
    isPrincipalOverride: isPrincipalWithAccess && !hasAccess,
    userRole,
  };
}

export function RequireRole({ 
  children, 
  allowedRoles, 
  fallback = null 
}: { 
  children: ReactNode; 
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}) {
  const { hasAccess, isPrincipalOverride, isLoading } = useRequireRole(allowedRoles);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!hasAccess) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return (
    <>
      {isPrincipalOverride && <PrincipalAccessBanner />}
      {children}
    </>
  );
}
