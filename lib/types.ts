export type Region =
  | 'Global'
  | 'Africa'
  | 'Europe'
  | 'Asia'
  | 'North America'
  | 'South America'
  | 'Oceania';

export type DataQualityFlag = 'reported' | 'estimated' | 'unavailable' | 'stale' | 'mocked';

export type MetricKey =
  | 'mortalityRate'
  | 'infectionRate'
  | 'recoveryRate'
  | 'totalDeaths'
  | 'totalCases'
  | 'activeOutbreaks';

export interface MetricValue {
  value: number | null;
  unit: 'percent' | 'count' | 'per100k';
  quality: DataQualityFlag;
  source: string;
  updatedAt: string;
}

export interface CountryMetric {
  iso: string;
  country: string;
  region: Region;
  latitude: number;
  longitude: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  mortalityRate: MetricValue;
  infectionRate: MetricValue;
  recoveryRate: MetricValue;
  totalDeaths: MetricValue;
  totalCases: MetricValue;
  activeOutbreaks: MetricValue;
}

export interface Disease {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  mortalityRate: MetricValue;
  infectionRate: MetricValue;
  recoveryRate: MetricValue;
  totalDeaths: MetricValue;
  totalCases: MetricValue;
  activeOutbreaks: MetricValue;
  affectedRegions: Region[];
  trend: 'up' | 'down' | 'flat';
  lastUpdated: string;
  sources: string[];
  countries: CountryMetric[];
  series: Array<{
    date: string;
    mortalityRate: number;
    totalDeaths: number;
    totalCases: number;
  }>;
}

export interface TopDisease {
  rank: number;
  diseaseId: string;
  slug: string;
  name: string;
  mortalityRate: number;
  totalDeaths: number;
  affectedRegions: Region[];
  trend: 'up' | 'down' | 'flat';
  lastUpdated: string;
  quality: DataQualityFlag;
}

export interface OutbreakNews {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  affectedCountry: string;
  affectedRegion: Region;
  url: string;
  severity: 'watch' | 'advisory' | 'emergency';
}

export interface Metadata {
  generatedAt: string;
  mortalityRefreshHours: number;
  outbreakRefreshHours: number;
  sources: Array<{
    name: string;
    url: string;
    cadence: string;
  }>;
  status: 'live' | 'fallback';
  warnings: string[];
}

export interface DashboardData {
  diseases: Disease[];
  countries: CountryMetric[];
  top10: TopDisease[];
  news: OutbreakNews[];
  metadata: Metadata;
}
