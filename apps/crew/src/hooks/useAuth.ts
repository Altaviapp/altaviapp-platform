'use client';

/**
 * Compatibility layer for useAuth hook
 *
 * Re-exports from @altaviapp/auth while maintaining backward compatibility
 * with existing components that use the old interface.
 *
 * New code should import directly from '@altaviapp/auth' or '@/providers/AuthProvider'
 */

import { useMemo } from 'react';
import {
  useAuth as useAuthProvider,
  type AuthUser,
  type UserRole,
  getRoleDisplayName,
} from '@altaviapp/auth';
import type { User } from '@/types';
import {
  canControlTrip as canControlTripFn,
  canAccessChecklist as canAccessChecklistFn,
  canPerformCheckin as canPerformCheckinFn,
  canReportIncident as canReportIncidentFn,
} from '@/types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  // Role helpers
  isDriver: boolean;
  isMonitor: boolean;
  isCrewMember: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  roleDisplayName: string;
  // Permission helpers
  canControlTrip: boolean;
  canAccessChecklist: boolean;
  canReportIncident: boolean;
  // This needs trip context, so it's a function
  getCanPerformCheckin: (tripMonitorId?: string | null) => boolean;
}

/**
 * Convert AuthUser to the legacy User type for backward compatibility
 */
function authUserToUser(authUser: AuthUser | null): User | null {
  if (!authUser) return null;

  return {
    _id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    role: authUser.role,
    institutionId: authUser.institutionId,
    isActive: true,
    createdAt: new Date(authUser.createdAt).toISOString(),
  };
}

/**
 * useAuth hook with backward compatibility
 *
 * Wraps the AuthProvider context to maintain the original interface
 * for existing components while using the new auth system.
 */
export function useAuth(): UseAuthReturn {
  const {
    user: authUser,
    isLoading,
    isAuthenticated,
    login: providerLogin,
    logout: providerLogout,
    isDriver,
    isMonitor,
    isCrewMember,
    isAdmin,
    isSuperAdmin,
  } = useAuthProvider();

  // Convert to legacy User type
  const user = useMemo(() => authUserToUser(authUser), [authUser]);

  // Wrap login to return the expected format
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const result = await providerLogin(email, password);
    return {
      success: result.success,
      error: result.error,
    };
  };

  // Wrap logout
  const logout = () => {
    providerLogout();
  };

  // Role helpers
  const role = user?.role as UserRole | undefined;
  const roleDisplayName = role ? getRoleDisplayName(role) : '';

  // Permission helpers
  const canControlTrip = role ? canControlTripFn(role) : false;
  const canAccessChecklist = role ? canAccessChecklistFn(role) : false;
  const canReportIncident = role ? canReportIncidentFn(role) : false;

  // Function that needs trip context
  const getCanPerformCheckin = (tripMonitorId?: string | null): boolean => {
    if (!role) return false;
    return canPerformCheckinFn(role, tripMonitorId);
  };

  return {
    user,
    loading: isLoading,
    isAuthenticated,
    login,
    logout,
    // Role helpers
    isDriver,
    isMonitor,
    isCrewMember,
    isAdmin,
    isSuperAdmin,
    roleDisplayName,
    // Permission helpers
    canControlTrip,
    canAccessChecklist,
    canReportIncident,
    getCanPerformCheckin,
  };
}
