// Navigation Types
export enum Tab {
  DASHBOARD = 'DASHBOARD',
  CONTRACTS = 'CONTRACTS',
  MODEL = 'MODEL',
  STRATEGY = 'STRATEGY',
  TESTS = 'TESTS',
  INFRA = 'INFRA',
  ADMIN = 'ADMIN',
}

// New Navigation Structure (4 Primary Sections)
export enum Section {
  OVERVIEW = 'OVERVIEW',
  ANALYTICS = 'ANALYTICS',
  DEVELOPER = 'DEVELOPER',
  MANAGE = 'MANAGE',
}

export interface NavigationItem {
  id: Section;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
  subItems?: SubNavigationItem[];
}

export interface SubNavigationItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}

// Stance Data Types
export interface StanceData {
  stance: 'BEARISH' | 'NEUTRAL' | 'BULLISH';
  score: number; // 0-100
  hedgeRatio: number; // 0-1
  trendStrength: number; // -1 to 1
}

// Dashboard Data Types
export interface DashboardData {
  stats: {
    tvl: { value: number; change24h: number };
    apy: { value: number; label: string };
    healthFactor: { value: number; status: string };
    range: { lower: number; upper: number; tickLower: number; tickUpper: number };
  };
  metrics: {
    volatility: number;
    skew: number;
    kurtosis: number;
    lastUpdate: string;
    nextRebalance: string;
  };
  chartData: Array<{
    day: number;
    price: number;
    upper: number;
    lower: number;
    volatility: number;
  }>;
  stance: StanceData;
}

// Toast Message Type
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}