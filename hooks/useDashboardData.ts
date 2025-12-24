import { useQuery } from '@tanstack/react-query';
import { fetchDashboardData } from '../api/realDataClient';
import { useReadContract, useAccount } from 'wagmi';
import { CORE_VAULT_ABI } from '../abis';
import { formatUnits } from 'viem';
import { DashboardData } from '../types';

const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`;

export const useDashboardData = () => {
    const { address } = useAccount();

    // 1. Fetch Mock Data (Charts, Stats fallback)
    const { data: mockData, isLoading: isMockLoading, refetch } = useQuery<DashboardData>({
        queryKey: ['dashboard-data'],
        queryFn: fetchDashboardData,
        refetchInterval: 30000,
    });

    // 2. Fetch Real Chain Data
    // TVL
    const { data: tvl } = useReadContract({
        address: VAULT_ADDRESS,
        abi: CORE_VAULT_ABI,
        functionName: 'totalAssets',
        query: {
            refetchInterval: 10000
        }
    });

    // User Balance
    const { data: userBalance } = useReadContract({
        address: VAULT_ADDRESS,
        abi: CORE_VAULT_ABI,
        functionName: 'balanceOf',
        args: [address!],
        query: {
            enabled: !!address,
            refetchInterval: 10000
        }
    });

    // Merge Real Data into Mock Data Structure
    const mergedData = mockData ? {
        ...mockData,
        stats: {
            ...mockData.stats,
            tvl: {
                ...mockData.stats.tvl,
                // Override Value if chain data exists, otherwise fallback to mock
                value: tvl ? Number(formatUnits(tvl, 6)) : mockData.stats.tvl.value
            },
            // We can add a user specific stat here if the UI supported it,
            // for now we just use the hook to verify we can read.
        }
    } : undefined;

    return {
        data: mergedData,
        isLoading: isMockLoading,
        refetch,
        userShareBalance: userBalance ? formatUnits(userBalance, 18) : '0', // Assuming Vault shares are 18 decimals
        vaultAddress: VAULT_ADDRESS
    };
};

