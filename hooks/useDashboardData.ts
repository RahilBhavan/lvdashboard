import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../api/mockClient';
import { DashboardData } from '../types';

export const useDashboardData = () => {
    return useQuery<DashboardData>({
        queryKey: ['dashboard-data'],
        queryFn: fetchDashboardData,
        refetchInterval: 30000, // Refresh every 30s
    });
};
