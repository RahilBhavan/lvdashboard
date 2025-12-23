export interface ChartDataPoint {
  day: number;
  price: number;
  upper: number;
  lower: number;
  volatility: number;
}

export enum Tab {
  DASHBOARD = 'dashboard',
  CONTRACTS = 'contracts',
  MODEL = 'model',
  TESTS = 'tests',
  INFRA = 'infra',

}

export interface DashboardStats {
  tvl: { value: number; change24h: number };
  apy: { value: number; label: string };
  healthFactor: { value: number; status: string };
  range: { lower: number; upper: number; tickLower: number; tickUpper: number };
}

export interface VectorMetrics {
  volatility: number;
  skew: number;
  kurtosis: number;
  lastUpdate: string;
  nextRebalance: string;
}

export interface DashboardData {
  stats: DashboardStats;
  metrics: VectorMetrics;
  chartData: ChartDataPoint[];
}