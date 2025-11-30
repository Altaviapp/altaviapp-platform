'use client';

import { useState, useEffect, useMemo } from 'react';
import type { User, UserRole } from '@/types';
import {
  canControlTrip as canControlTripFn,
  canAccessChecklist as canAccessChecklistFn,
  canPerformCheckin as canPerformCheckinFn,
  canReportIncident as canReportIncidentFn,
  isCrewMember as isCrewMemberFn,
  getRoleDisplayName
} from '@/types';
import { mockDriver, mockMonitor } from '@/lib/mockData';

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
 * Custom hook for authentication (mock implementation)
 *
 * Mock credentials:
 * - Conductor: conductor@altaviapp.ec / demo123
 * - Monitor: monitor@altaviapp.ec / demo123
 *
 * In production, this will be replaced with actual API calls
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: check if user is logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login function (mock implementation)
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock validation - Conductor
    if (email === 'conductor@altaviapp.ec' && password === 'demo123') {
      localStorage.setItem('user', JSON.stringify(mockDriver));
      localStorage.setItem('authToken', 'mock-token-driver-' + Date.now());
      setUser(mockDriver);
      return { success: true };
    }

    // Mock validation - Monitor
    if (email === 'monitor@altaviapp.ec' && password === 'demo123') {
      localStorage.setItem('user', JSON.stringify(mockMonitor));
      localStorage.setItem('authToken', 'mock-token-monitor-' + Date.now());
      setUser(mockMonitor);
      return { success: true };
    }

    return {
      success: false,
      error: 'Credenciales incorrectas. Use: conductor@altaviapp.ec o monitor@altaviapp.ec / demo123',
    };
  };

  /**
   * Logout function
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setUser(null);
  };

  // Computed role helpers
  const role = user?.role as UserRole | undefined;

  const isDriver = role === 'driver';
  const isMonitor = role === 'monitor';
  const isAdmin = role === 'admin' || role === 'super_admin';
  const isSuperAdmin = role === 'super_admin';
  const isCrewMember = role ? isCrewMemberFn(role) : false;
  const roleDisplayName = role ? getRoleDisplayName(role) : '';

  // Computed permission helpers
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
    loading,
    isAuthenticated: !!user,
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
