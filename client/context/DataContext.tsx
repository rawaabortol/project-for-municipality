import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  Alert,
  Category,
  Cluster,
  DashboardStats,
  EMPTY_STATS,
  Investigation,
  Report,
  User
} from '../utils/sampleData';
import { reportService } from '../services/reportService';
import { clusterService } from '../services/clusterService';
import { alertService } from '../services/alertService';
import { investigationService } from '../services/investigationService';
import { categoryService } from '../services/categoryService';
import { dashboardService } from '../services/dashboardService';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

const POLL_INTERVAL_MS = 60_000;

interface DataContextType {
  reports: Report[];
  clusters: Cluster[];
  alerts: Alert[];
  investigations: Investigation[];
  categories: Category[];
  officers: User[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  /** Re-fetches everything the current role may see. Call after any mutation. */
  refresh: () => Promise<void>;
}

const EMPTY_DATA = {
  reports: [] as Report[],
  clusters: [] as Cluster[],
  alerts: [] as Alert[],
  investigations: [] as Investigation[],
  categories: [] as Category[],
  officers: [] as User[],
  stats: EMPTY_STATS
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [data, setData] = useState(EMPTY_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = currentUser?.id;
  const role = currentUser?.role;
  const isStaff = role === 'HEALTH_OFFICER' || role === 'ADMINISTRATOR';

  const refresh = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [reports, categories, stats, clusters, alerts, investigations, officers] = await Promise.all([
        reportService.getReports(),
        categoryService.getCategories(),
        dashboardService.getStats(),
        isStaff ? clusterService.getClusters() : Promise.resolve([]),
        isStaff ? alertService.getAlerts() : Promise.resolve([]),
        isStaff ? investigationService.getInvestigations() : Promise.resolve([]),
        isStaff ? userService.getOfficers() : Promise.resolve([])
      ]);
      setData({ reports, categories, stats, clusters, alerts, investigations, officers });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isStaff]);

  useEffect(() => {
    if (!userId) {
      setData(EMPTY_DATA);
      return;
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [userId, refresh]);

  return (
    <DataContext.Provider value={{ ...data, isLoading, error, refresh }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
