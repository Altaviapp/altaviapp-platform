'use client';

import { useState, useEffect } from 'react';
import type { DashboardData } from '@/types';
import { mockDashboardData } from '@/lib/mockData';

interface UseDashboardDataReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook for dashboard data (mock implementation)
 *
 * In production, this will fetch data from Convex with real-time subscriptions
 */
export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Set mock data
      setData(mockDashboardData);
    } catch (err) {
      setError('Error al cargar datos del dashboard');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
