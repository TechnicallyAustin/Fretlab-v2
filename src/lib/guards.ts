// src/lib/guards.ts

import { User } from './db/types';
import { useAuth } from './auth';

/**
 * Check if user has required role for access.
 */
export function hasRole(user: User | null, requiredRole: 'owner' | 'admin' | 'member'): boolean {
  if (!user) return false;
  
  // owner can do everything
  if (user.role === 'owner') return true;
  
  // admin can do everything except owner-only actions
  if (user.role === 'admin' && requiredRole !== 'owner') return true;
  
  // member can do member-only actions
  if (user.role === 'member' && requiredRole === 'member') return true;
  
  return false;
}

/**
 * Guard component that checks user authentication and role.
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole?: 'owner' | 'admin' | 'member'
): React.ComponentType<P> {
  return function AuthGuard(props) {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
      return <div>Loading...</div>;
    }
    
    if (!isAuthenticated) {
      // Redirect to login page
      window.location.href = '/login';
      return null;
    }
    
    if (requiredRole && !hasRole(user, requiredRole)) {
      // Redirect to unauthorized page or 403
      window.location.href = '/unauthorized';
      return null;
    }
    
    return <Component {...props} />;
  };
}