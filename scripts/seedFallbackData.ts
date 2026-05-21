import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CountryMetric, DataQualityFlag, Disease, Metadata, MetricValue, OutbreakNews, Region, TopDisease } from '../lib/types';

const generatedAt = new Date().toISOString();
const dataDir = path.join(process.cwd(), 'public', 'data');

type CountrySeed = {
  iso: string;
  country: string;
  region: Region;
  latitude: number;
  longitude: number;
  severity: CountryMetric['severity'];
  mortalityRate: number | null;
  infectionRate?: number | null;
  recoveryRate?: number | null;
  totalDeaths: number | null;
  totalCases?: number | null;
  activeOutbreaks?: number | null;
};

type DiseaseSeed = {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  mortalityRate: number | null;
  infectionRate?: number | null;
  recoveryRate?: number | null;
  totalDeaths: number | null;
  totalCases?: number | null;
  activeOutbreaks?: number | null;
  affectedRegions: Region[];
  trend: Disease['trend'];
  source: string;
  quality?: DataQualityFlag;
  countries: CountrySeed[];
  series: Disease['series'];
};

function metric(value: number | null | undefined, unit: MetricValue['unit'], quality: DataQualityFlag, source: string): MetricValue {
  return {
    value: value ?? null,
    unit,
    quality: value === null || value === undefined ? 'unavailable' : quality,
    source,
    updatedAt: generatedAt
  };
}

function countryMetric(seed: CountrySeed, source: string, quality: DataQualityFlag): CountryMetric {
  return {
    iso: seed.iso,
    country: seed.country,
    region: seed.region,
    latitude: seed.latitude,
    longitude: seed.longitude,
    severity: seed.severity,
    mortalityRate: metric(seed.mortalityRate, 'percent', quality, source),
    infectionRate: metric(seed.infectionRate, 'per100k', seed.infectionRate == null ? 'unavailable' : quality, source),
    recoveryRate: metric(seed.recoveryRate, 'percent', seed.recoveryRate == null ? 'unavailable' : 'mocked', seed.recoveryRate == null ? 'Not consistently published' : 'Fallback model'),
    totalDeaths: metric(seed.totalDeaths, 'count', quality, source),
    totalCases: metric(seed.totalCases, 'count', seed.totalCases == null ? 'unavailable' : quality, source),
    activeOutbreaks: metric(seed.activeOutbreaks, 'count', seed.activeOutbreaks == null ? 'unavailable' : quality, source)
  };
}

function disease(seed: DiseaseSeed): Disease {
  const quality = seed.quality ?? 'estimated';
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    category: seed.category,
    summary: seed.summary,
    mortalityRate: metric(seed.mortalityRate, 'percent', quality, seed.source),
    infectionRate: metric(seed.infectionRate, 'per100k', seed.infectionRate == null ? 'unavailable' : quality, seed.source),
    recoveryRate: metric(seed.recoveryRate, 'percent', seed.recoveryRate == null ? 'unavailable' : 'mocked', seed.recoveryRate == null ? 'Not consistently published' : 'Fallback model'),
    totalDeaths: metric(seed.totalDeaths, 'count', quality, seed.source),
    totalCases: metric(seed.totalCases, 'count', seed.totalCases == null ? 'unavailable' : quality, seed.source),
    activeOutbreaks: metric(seed.activeOutbreaks, 'count', seed.activeOutbreaks == null ? 'unavailable' : quality, seed.source),
    affectedRegions: seed.affectedRegions,
    trend: seed.trend,
    lastUpdated: generatedAt,
    sources: [seed.source],
    countries: seed.countries.map((item) => countryMetric(item, seed.source, quality)),
    series: seed.series
  };
}

const seeds: DiseaseSeed[] = [
  {
    id: 'ihd',
    slug: 'ischaemic-heart-disease',
    name: 'Ischaemic heart disease',
    category: 'Noncommunicable disease',
    summary: 'A leading global cause of death caused by reduced blood flow to the heart, with risk shaped by age, blood pressure, lipids, diabetes, smoking, and access to acute cardiac care.',
    mortalityRate: 12.9,
    totalDeaths: 9100000,
    affectedRegions: ['Global', 'Asia', 'Europe', 'North America'],
    trend: 'flat',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'critical', mortalityRate: 14.7, totalDeaths: 1800000 },
      { iso: 'CHN', country: 'China', region: 'Asia', latitude: 35.8617, longitude: 104.1954, severity: 'critical', mortalityRate: 15.1, totalDeaths: 1700000 },
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'high', mortalityRate: 10.9, totalDeaths: 695000 }
    ],
    series: [
      { date: '2021', mortalityRate: 13.3, totalDeaths: 8900000, totalCases: 0 },
      { date: '2022', mortalityRate: 13.1, totalDeaths: 9000000, totalCases: 0 },
      { date: '2023', mortalityRate: 13.0, totalDeaths: 9050000, totalCases: 0 },
      { date: '2024', mortalityRate: 12.9, totalDeaths: 9100000, totalCases: 0 }
    ]
  },
  {
    id: 'stroke',
    slug: 'stroke',
    name: 'Stroke',
    category: 'Noncommunicable disease',
    summary: 'A major cerebrovascular cause of mortality and disability, driven by ischemic and hemorrhagic events and strongly affected by emergency response capacity.',
    mortalityRate: 10.2,
    totalDeaths: 6600000,
    affectedRegions: ['Global', 'Asia', 'Africa', 'Europe'],
    trend: 'flat',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'CHN', country: 'China', region: 'Asia', latitude: 35.8617, longitude: 104.1954, severity: 'critical', mortalityRate: 13.4, totalDeaths: 2200000 },
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'critical', mortalityRate: 11.1, totalDeaths: 770000 },
      { iso: 'RUS', country: 'Russia', region: 'Europe', latitude: 61.524, longitude: 105.3188, severity: 'high', mortalityRate: 9.6, totalDeaths: 310000 }
    ],
    series: [
      { date: '2021', mortalityRate: 10.5, totalDeaths: 6500000, totalCases: 0 },
      { date: '2022', mortalityRate: 10.4, totalDeaths: 6550000, totalCases: 0 },
      { date: '2023', mortalityRate: 10.3, totalDeaths: 6580000, totalCases: 0 },
      { date: '2024', mortalityRate: 10.2, totalDeaths: 6600000, totalCases: 0 }
    ]
  },
  {
    id: 'copd',
    slug: 'chronic-obstructive-pulmonary-disease-copd',
    name: 'Chronic obstructive pulmonary disease / COPD',
    category: 'Noncommunicable respiratory disease',
    summary: 'A chronic respiratory condition linked to tobacco smoke, air pollution, occupational exposure, and aging populations.',
    mortalityRate: 5.6,
    totalDeaths: 3500000,
    affectedRegions: ['Global', 'Asia', 'Europe', 'North America'],
    trend: 'up',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'CHN', country: 'China', region: 'Asia', latitude: 35.8617, longitude: 104.1954, severity: 'critical', mortalityRate: 6.8, totalDeaths: 910000 },
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'high', mortalityRate: 5.9, totalDeaths: 760000 },
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'moderate', mortalityRate: 4.4, totalDeaths: 150000 }
    ],
    series: [
      { date: '2021', mortalityRate: 5.3, totalDeaths: 3300000, totalCases: 0 },
      { date: '2022', mortalityRate: 5.4, totalDeaths: 3380000, totalCases: 0 },
      { date: '2023', mortalityRate: 5.5, totalDeaths: 3450000, totalCases: 0 },
      { date: '2024', mortalityRate: 5.6, totalDeaths: 3500000, totalCases: 0 }
    ]
  },
  {
    id: 'lri',
    slug: 'lower-respiratory-infections',
    name: 'Lower respiratory infections',
    category: 'Infectious disease',
    summary: 'A broad infectious category including pneumonia and related lower airway infections, with elevated risk among young children, older adults, and immunocompromised populations.',
    mortalityRate: 3.8,
    infectionRate: 2100,
    recoveryRate: 92.4,
    totalDeaths: 2500000,
    totalCases: 420000000,
    activeOutbreaks: 42,
    affectedRegions: ['Global', 'Africa', 'Asia', 'Europe'],
    trend: 'flat',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'critical', mortalityRate: 4.1, infectionRate: 2800, recoveryRate: 91.5, totalDeaths: 520000, totalCases: 74000000, activeOutbreaks: 6 },
      { iso: 'NGA', country: 'Nigeria', region: 'Africa', latitude: 9.082, longitude: 8.6753, severity: 'critical', mortalityRate: 4.8, infectionRate: 3300, recoveryRate: 90.2, totalDeaths: 260000, totalCases: 12000000, activeOutbreaks: 8 },
      { iso: 'PAK', country: 'Pakistan', region: 'Asia', latitude: 30.3753, longitude: 69.3451, severity: 'high', mortalityRate: 4.3, infectionRate: 2600, recoveryRate: 91.0, totalDeaths: 190000, totalCases: 16000000, activeOutbreaks: 4 }
    ],
    series: [
      { date: '2021', mortalityRate: 4.0, totalDeaths: 2650000, totalCases: 405000000 },
      { date: '2022', mortalityRate: 3.9, totalDeaths: 2580000, totalCases: 410000000 },
      { date: '2023', mortalityRate: 3.9, totalDeaths: 2530000, totalCases: 416000000 },
      { date: '2024', mortalityRate: 3.8, totalDeaths: 2500000, totalCases: 420000000 }
    ]
  },
  {
    id: 'neonatal',
    slug: 'neonatal-conditions',
    name: 'Neonatal conditions',
    category: 'Maternal and child health',
    summary: 'A group of newborn health conditions including preterm birth complications, birth asphyxia, neonatal sepsis, and congenital complications.',
    mortalityRate: 6.1,
    totalDeaths: 1900000,
    affectedRegions: ['Global', 'Africa', 'Asia'],
    trend: 'down',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'critical', mortalityRate: 6.4, totalDeaths: 410000 },
      { iso: 'NGA', country: 'Nigeria', region: 'Africa', latitude: 9.082, longitude: 8.6753, severity: 'critical', mortalityRate: 7.2, totalDeaths: 270000 },
      { iso: 'PAK', country: 'Pakistan', region: 'Asia', latitude: 30.3753, longitude: 69.3451, severity: 'high', mortalityRate: 6.8, totalDeaths: 190000 }
    ],
    series: [
      { date: '2021', mortalityRate: 6.6, totalDeaths: 2050000, totalCases: 0 },
      { date: '2022', mortalityRate: 6.4, totalDeaths: 1990000, totalCases: 0 },
      { date: '2023', mortalityRate: 6.2, totalDeaths: 1940000, totalCases: 0 },
      { date: '2024', mortalityRate: 6.1, totalDeaths: 1900000, totalCases: 0 }
    ]
  },
  {
    id: 'lung-cancers',
    slug: 'trachea-bronchus-and-lung-cancers',
    name: 'Trachea, bronchus, and lung cancers',
    category: 'Cancer',
    summary: 'A high-mortality cancer group associated with tobacco exposure, air pollution, occupational risk, and late-stage detection.',
    mortalityRate: 18.5,
    totalDeaths: 1800000,
    affectedRegions: ['Global', 'Asia', 'Europe', 'North America'],
    trend: 'flat',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'CHN', country: 'China', region: 'Asia', latitude: 35.8617, longitude: 104.1954, severity: 'critical', mortalityRate: 21.3, totalDeaths: 720000 },
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'high', mortalityRate: 16.1, totalDeaths: 130000 },
      { iso: 'DEU', country: 'Germany', region: 'Europe', latitude: 51.1657, longitude: 10.4515, severity: 'moderate', mortalityRate: 15.8, totalDeaths: 46000 }
    ],
    series: [
      { date: '2021', mortalityRate: 18.7, totalDeaths: 1760000, totalCases: 0 },
      { date: '2022', mortalityRate: 18.6, totalDeaths: 1780000, totalCases: 0 },
      { date: '2023', mortalityRate: 18.5, totalDeaths: 1790000, totalCases: 0 },
      { date: '2024', mortalityRate: 18.5, totalDeaths: 1800000, totalCases: 0 }
    ]
  },
  {
    id: 'dementias',
    slug: 'alzheimers-disease-and-other-dementias',
    name: "Alzheimer's disease and other dementias",
    category: 'Neurological disease',
    summary: 'A progressive neurological disease category with increasing mortality burden in aging populations and long-term care systems.',
    mortalityRate: 7.4,
    totalDeaths: 1800000,
    affectedRegions: ['Global', 'Europe', 'North America', 'Asia'],
    trend: 'up',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'high', mortalityRate: 8.2, totalDeaths: 120000 },
      { iso: 'JPN', country: 'Japan', region: 'Asia', latitude: 36.2048, longitude: 138.2529, severity: 'high', mortalityRate: 9.1, totalDeaths: 115000 },
      { iso: 'ITA', country: 'Italy', region: 'Europe', latitude: 41.8719, longitude: 12.5674, severity: 'moderate', mortalityRate: 8.8, totalDeaths: 67000 }
    ],
    series: [
      { date: '2021', mortalityRate: 6.9, totalDeaths: 1650000, totalCases: 0 },
      { date: '2022', mortalityRate: 7.1, totalDeaths: 1700000, totalCases: 0 },
      { date: '2023', mortalityRate: 7.3, totalDeaths: 1760000, totalCases: 0 },
      { date: '2024', mortalityRate: 7.4, totalDeaths: 1800000, totalCases: 0 }
    ]
  },
  {
    id: 'diabetes',
    slug: 'diabetes-mellitus',
    name: 'Diabetes mellitus',
    category: 'Metabolic disease',
    summary: 'A chronic metabolic disease with mortality linked to cardiovascular, renal, infectious, and acute glycemic complications.',
    mortalityRate: 4.2,
    totalDeaths: 1500000,
    affectedRegions: ['Global', 'Asia', 'North America', 'Africa'],
    trend: 'up',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'high', mortalityRate: 4.5, totalDeaths: 260000 },
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'high', mortalityRate: 3.9, totalDeaths: 104000 },
      { iso: 'MEX', country: 'Mexico', region: 'North America', latitude: 23.6345, longitude: -102.5528, severity: 'high', mortalityRate: 5.3, totalDeaths: 115000 }
    ],
    series: [
      { date: '2021', mortalityRate: 3.9, totalDeaths: 1410000, totalCases: 0 },
      { date: '2022', mortalityRate: 4.0, totalDeaths: 1450000, totalCases: 0 },
      { date: '2023', mortalityRate: 4.1, totalDeaths: 1480000, totalCases: 0 },
      { date: '2024', mortalityRate: 4.2, totalDeaths: 1500000, totalCases: 0 }
    ]
  },
  {
    id: 'diarrhoeal',
    slug: 'diarrhoeal-diseases',
    name: 'Diarrhoeal diseases',
    category: 'Infectious disease',
    summary: 'A water, sanitation, food safety, and pathogen-driven disease group with highest mortality risk among children and vulnerable populations.',
    mortalityRate: 1.9,
    infectionRate: 5400,
    recoveryRate: 96.5,
    totalDeaths: 1200000,
    totalCases: 1700000000,
    activeOutbreaks: 38,
    affectedRegions: ['Global', 'Africa', 'Asia', 'South America'],
    trend: 'down',
    source: 'WHO Global Health Estimates fallback',
    countries: [
      { iso: 'NGA', country: 'Nigeria', region: 'Africa', latitude: 9.082, longitude: 8.6753, severity: 'critical', mortalityRate: 2.4, infectionRate: 6900, recoveryRate: 95.8, totalDeaths: 160000, totalCases: 32000000, activeOutbreaks: 7 },
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'high', mortalityRate: 1.7, infectionRate: 5200, recoveryRate: 96.9, totalDeaths: 140000, totalCases: 90000000, activeOutbreaks: 5 },
      { iso: 'ETH', country: 'Ethiopia', region: 'Africa', latitude: 9.145, longitude: 40.4897, severity: 'high', mortalityRate: 2.2, infectionRate: 6100, recoveryRate: 96.0, totalDeaths: 72000, totalCases: 14000000, activeOutbreaks: 4 }
    ],
    series: [
      { date: '2021', mortalityRate: 2.1, totalDeaths: 1320000, totalCases: 1680000000 },
      { date: '2022', mortalityRate: 2.0, totalDeaths: 1270000, totalCases: 1690000000 },
      { date: '2023', mortalityRate: 2.0, totalDeaths: 1230000, totalCases: 1700000000 },
      { date: '2024', mortalityRate: 1.9, totalDeaths: 1200000, totalCases: 1700000000 }
    ]
  },
  {
    id: 'tb',
    slug: 'tuberculosis',
    name: 'Tuberculosis',
    category: 'Bacterial infection',
    summary: 'A long-running airborne infectious disease burden with high mortality in several regions when diagnosis and treatment access are delayed.',
    mortalityRate: 14.1,
    infectionRate: 134.2,
    recoveryRate: 85.2,
    totalDeaths: 1250000,
    totalCases: 10600000,
    activeOutbreaks: 18,
    affectedRegions: ['Africa', 'Asia', 'Europe'],
    trend: 'flat',
    source: 'WHO Global Tuberculosis Programme fallback',
    countries: [
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'critical', mortalityRate: 15.4, infectionRate: 199, recoveryRate: 83, totalDeaths: 331000, totalCases: 2800000, activeOutbreaks: 4 },
      { iso: 'IDN', country: 'Indonesia', region: 'Asia', latitude: -0.7893, longitude: 113.9213, severity: 'high', mortalityRate: 13.8, infectionRate: 385, recoveryRate: 84.6, totalDeaths: 134000, totalCases: 1060000, activeOutbreaks: 2 },
      { iso: 'PHL', country: 'Philippines', region: 'Asia', latitude: 12.8797, longitude: 121.774, severity: 'high', mortalityRate: 12.6, infectionRate: 320, recoveryRate: 86.1, totalDeaths: 72000, totalCases: 740000, activeOutbreaks: 3 }
    ],
    series: [
      { date: '2021', mortalityRate: 15.2, totalDeaths: 1400000, totalCases: 10000000 },
      { date: '2022', mortalityRate: 14.8, totalDeaths: 1320000, totalCases: 10300000 },
      { date: '2023', mortalityRate: 14.5, totalDeaths: 1300000, totalCases: 10500000 },
      { date: '2024', mortalityRate: 14.1, totalDeaths: 1250000, totalCases: 10600000 }
    ]
  },
  {
    id: 'covid-19',
    slug: 'covid-19',
    name: 'COVID-19',
    category: 'Viral outbreak tracker',
    summary: 'A monitored respiratory viral threat with recurrent waves, variant surveillance, and periodic reporting gaps across jurisdictions.',
    mortalityRate: 0.9,
    infectionRate: 120,
    recoveryRate: 98.1,
    totalDeaths: 7000000,
    totalCases: 775000000,
    activeOutbreaks: 31,
    affectedRegions: ['Global', 'Asia', 'Europe', 'North America', 'South America'],
    trend: 'flat',
    source: 'WHO/OWID fallback sample',
    countries: [
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'high', mortalityRate: 1.1, infectionRate: 180, recoveryRate: 98.4, totalDeaths: 1200000, totalCases: 104000000, activeOutbreaks: 6 },
      { iso: 'IND', country: 'India', region: 'Asia', latitude: 20.5937, longitude: 78.9629, severity: 'high', mortalityRate: 0.7, infectionRate: 95, recoveryRate: 98.8, totalDeaths: 535000, totalCases: 45000000, activeOutbreaks: 5 },
      { iso: 'BRA', country: 'Brazil', region: 'South America', latitude: -14.235, longitude: -51.9253, severity: 'moderate', mortalityRate: 1.5, infectionRate: 110, recoveryRate: 97.9, totalDeaths: 710000, totalCases: 38000000, activeOutbreaks: 4 }
    ],
    series: [
      { date: '2021', mortalityRate: 1.8, totalDeaths: 3500000, totalCases: 290000000 },
      { date: '2022', mortalityRate: 1.2, totalDeaths: 6500000, totalCases: 650000000 },
      { date: '2023', mortalityRate: 1.0, totalDeaths: 6900000, totalCases: 760000000 },
      { date: '2024', mortalityRate: 0.9, totalDeaths: 7000000, totalCases: 775000000 }
    ]
  },
  {
    id: 'influenza',
    slug: 'influenza',
    name: 'Influenza',
    category: 'Viral outbreak tracker',
    summary: 'A seasonal respiratory viral threat monitored through sentinel surveillance, hospitalization burden, and excess mortality signals.',
    mortalityRate: 0.08,
    infectionRate: 4800,
    recoveryRate: 99.1,
    totalDeaths: 390000,
    totalCases: 1000000000,
    activeOutbreaks: 44,
    affectedRegions: ['Global', 'Europe', 'Asia', 'North America'],
    trend: 'up',
    source: 'WHO GISRS fallback sample',
    countries: [
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'high', mortalityRate: 0.07, infectionRate: 5600, recoveryRate: 99.2, totalDeaths: 36000, totalCases: 43000000, activeOutbreaks: 8 },
      { iso: 'JPN', country: 'Japan', region: 'Asia', latitude: 36.2048, longitude: 138.2529, severity: 'moderate', mortalityRate: 0.05, infectionRate: 4200, recoveryRate: 99.3, totalDeaths: 9800, totalCases: 12000000, activeOutbreaks: 4 },
      { iso: 'FRA', country: 'France', region: 'Europe', latitude: 46.2276, longitude: 2.2137, severity: 'moderate', mortalityRate: 0.06, infectionRate: 3900, recoveryRate: 99.2, totalDeaths: 11000, totalCases: 9000000, activeOutbreaks: 3 }
    ],
    series: [
      { date: '2021', mortalityRate: 0.04, totalDeaths: 210000, totalCases: 460000000 },
      { date: '2022', mortalityRate: 0.06, totalDeaths: 300000, totalCases: 760000000 },
      { date: '2023', mortalityRate: 0.07, totalDeaths: 360000, totalCases: 920000000 },
      { date: '2024', mortalityRate: 0.08, totalDeaths: 390000, totalCases: 1000000000 }
    ]
  },
  {
    id: 'ebola',
    slug: 'ebola-virus-disease',
    name: 'Ebola virus disease',
    category: 'Viral outbreak tracker',
    summary: 'A severe viral disease with high case fatality during outbreaks, requiring rapid surveillance, isolation, and contact tracing.',
    mortalityRate: 50,
    infectionRate: 0.02,
    recoveryRate: 48,
    totalDeaths: 18,
    totalCases: 36,
    activeOutbreaks: 1,
    affectedRegions: ['Africa'],
    trend: 'flat',
    source: 'WHO Disease Outbreak News fallback',
    countries: [
      { iso: 'UGA', country: 'Uganda', region: 'Africa', latitude: 1.3733, longitude: 32.2903, severity: 'high', mortalityRate: 47, infectionRate: 0.07, recoveryRate: 50, totalDeaths: 18, totalCases: 36, activeOutbreaks: 1 },
      { iso: 'COD', country: 'Democratic Republic of the Congo', region: 'Africa', latitude: -4.0383, longitude: 21.7587, severity: 'moderate', mortalityRate: 45, infectionRate: 0.02, recoveryRate: 52, totalDeaths: 0, totalCases: 0, activeOutbreaks: 0 }
    ],
    series: [
      { date: '2021', mortalityRate: 46, totalDeaths: 6, totalCases: 13 },
      { date: '2022', mortalityRate: 47, totalDeaths: 55, totalCases: 116 },
      { date: '2023', mortalityRate: 50, totalDeaths: 0, totalCases: 0 },
      { date: '2024', mortalityRate: 50, totalDeaths: 18, totalCases: 36 }
    ]
  },
  {
    id: 'mpox',
    slug: 'mpox',
    name: 'Mpox',
    category: 'Viral outbreak tracker',
    summary: 'A monitored orthopoxvirus threat with transmission clusters, vaccination-response considerations, and regionally variable reporting.',
    mortalityRate: 0.2,
    infectionRate: 6.2,
    recoveryRate: 98.7,
    totalDeaths: 280,
    totalCases: 98000,
    activeOutbreaks: 14,
    affectedRegions: ['Africa', 'Europe', 'North America', 'South America'],
    trend: 'up',
    source: 'WHO Disease Outbreak News fallback',
    countries: [
      { iso: 'COD', country: 'Democratic Republic of the Congo', region: 'Africa', latitude: -4.0383, longitude: 21.7587, severity: 'critical', mortalityRate: 3.1, infectionRate: 22, recoveryRate: 95.5, totalDeaths: 220, totalCases: 14000, activeOutbreaks: 5 },
      { iso: 'USA', country: 'United States', region: 'North America', latitude: 37.0902, longitude: -95.7129, severity: 'moderate', mortalityRate: 0.03, infectionRate: 8, recoveryRate: 99.5, totalDeaths: 35, totalCases: 32000, activeOutbreaks: 2 },
      { iso: 'ESP', country: 'Spain', region: 'Europe', latitude: 40.4637, longitude: -3.7492, severity: 'moderate', mortalityRate: 0.02, infectionRate: 7, recoveryRate: 99.4, totalDeaths: 10, totalCases: 7600, activeOutbreaks: 1 }
    ],
    series: [
      { date: '2021', mortalityRate: 0.1, totalDeaths: 30, totalCases: 5000 },
      { date: '2022', mortalityRate: 0.1, totalDeaths: 120, totalCases: 86000 },
      { date: '2023', mortalityRate: 0.2, totalDeaths: 210, totalCases: 92000 },
      { date: '2024', mortalityRate: 0.2, totalDeaths: 280, totalCases: 98000 }
    ]
  },
  {
    id: 'dengue',
    slug: 'dengue',
    name: 'Dengue',
    category: 'Viral outbreak tracker',
    summary: 'A mosquito-borne viral threat with expanding geographic range, seasonal surges, and hospitalization risk from severe dengue.',
    mortalityRate: 0.05,
    infectionRate: 8600,
    recoveryRate: 99.0,
    totalDeaths: 6500,
    totalCases: 6500000,
    activeOutbreaks: 35,
    affectedRegions: ['Asia', 'South America', 'Africa', 'North America'],
    trend: 'up',
    source: 'WHO arbovirus fallback sample',
    countries: [
      { iso: 'BRA', country: 'Brazil', region: 'South America', latitude: -14.235, longitude: -51.9253, severity: 'critical', mortalityRate: 0.06, infectionRate: 12000, recoveryRate: 98.9, totalDeaths: 4200, totalCases: 4200000, activeOutbreaks: 9 },
      { iso: 'IDN', country: 'Indonesia', region: 'Asia', latitude: -0.7893, longitude: 113.9213, severity: 'high', mortalityRate: 0.04, infectionRate: 7200, recoveryRate: 99.1, totalDeaths: 900, totalCases: 900000, activeOutbreaks: 5 },
      { iso: 'PER', country: 'Peru', region: 'South America', latitude: -9.19, longitude: -75.0152, severity: 'high', mortalityRate: 0.07, infectionRate: 9100, recoveryRate: 98.8, totalDeaths: 430, totalCases: 260000, activeOutbreaks: 4 }
    ],
    series: [
      { date: '2021', mortalityRate: 0.04, totalDeaths: 2500, totalCases: 2700000 },
      { date: '2022', mortalityRate: 0.04, totalDeaths: 3200, totalCases: 3600000 },
      { date: '2023', mortalityRate: 0.05, totalDeaths: 5200, totalCases: 5200000 },
      { date: '2024', mortalityRate: 0.05, totalDeaths: 6500, totalCases: 6500000 }
    ]
  },
  {
    id: 'measles',
    slug: 'measles',
    name: 'Measles',
    category: 'Viral outbreak tracker',
    summary: 'A highly contagious vaccine-preventable disease monitored for immunity gaps, importations, and outbreak clusters.',
    mortalityRate: 0.15,
    infectionRate: 48,
    recoveryRate: 98.6,
    totalDeaths: 136000,
    totalCases: 9200000,
    activeOutbreaks: 29,
    affectedRegions: ['Africa', 'Asia', 'Europe', 'North America'],
    trend: 'up',
    source: 'WHO/UNICEF fallback sample',
    countries: [
      { iso: 'COD', country: 'Democratic Republic of the Congo', region: 'Africa', latitude: -4.0383, longitude: 21.7587, severity: 'critical', mortalityRate: 0.3, infectionRate: 160, recoveryRate: 97.9, totalDeaths: 52000, totalCases: 1100000, activeOutbreaks: 8 },
      { iso: 'ETH', country: 'Ethiopia', region: 'Africa', latitude: 9.145, longitude: 40.4897, severity: 'high', mortalityRate: 0.24, infectionRate: 120, recoveryRate: 98.1, totalDeaths: 14000, totalCases: 420000, activeOutbreaks: 5 },
      { iso: 'PAK', country: 'Pakistan', region: 'Asia', latitude: 30.3753, longitude: 69.3451, severity: 'high', mortalityRate: 0.18, infectionRate: 90, recoveryRate: 98.4, totalDeaths: 9500, totalCases: 310000, activeOutbreaks: 3 }
    ],
    series: [
      { date: '2021', mortalityRate: 0.13, totalDeaths: 128000, totalCases: 7600000 },
      { date: '2022', mortalityRate: 0.14, totalDeaths: 132000, totalCases: 8200000 },
      { date: '2023', mortalityRate: 0.15, totalDeaths: 134000, totalCases: 8800000 },
      { date: '2024', mortalityRate: 0.15, totalDeaths: 136000, totalCases: 9200000 }
    ]
  },
  {
    id: 'cholera',
    slug: 'cholera',
    name: 'Cholera',
    category: 'Bacterial outbreak tracker',
    summary: 'An acute diarrheal disease tied to water and sanitation disruption, capable of fast-moving outbreaks in humanitarian emergencies.',
    mortalityRate: 1.8,
    infectionRate: 18.2,
    recoveryRate: 97.5,
    totalDeaths: 4700,
    totalCases: 260000,
    activeOutbreaks: 31,
    affectedRegions: ['Africa', 'Asia'],
    trend: 'up',
    source: 'WHO Disease Outbreak News fallback',
    countries: [
      { iso: 'ZMB', country: 'Zambia', region: 'Africa', latitude: -13.1339, longitude: 27.8493, severity: 'high', mortalityRate: 2.5, infectionRate: 92, recoveryRate: 96.9, totalDeaths: 760, totalCases: 30400, activeOutbreaks: 2 },
      { iso: 'YEM', country: 'Yemen', region: 'Asia', latitude: 15.5527, longitude: 48.5164, severity: 'critical', mortalityRate: 1.9, infectionRate: 140, recoveryRate: 97.2, totalDeaths: 1500, totalCases: 76000, activeOutbreaks: 4 },
      { iso: 'HTI', country: 'Haiti', region: 'North America', latitude: 18.9712, longitude: -72.2852, severity: 'high', mortalityRate: 2.0, infectionRate: 110, recoveryRate: 96.8, totalDeaths: 820, totalCases: 42000, activeOutbreaks: 3 }
    ],
    series: [
      { date: '2021', mortalityRate: 1.2, totalDeaths: 1800, totalCases: 150000 },
      { date: '2022', mortalityRate: 1.4, totalDeaths: 2700, totalCases: 190000 },
      { date: '2023', mortalityRate: 1.6, totalDeaths: 3900, totalCases: 235000 },
      { date: '2024', mortalityRate: 1.8, totalDeaths: 4700, totalCases: 260000 }
    ]
  },
  {
    id: 'marburg',
    slug: 'marburg-virus-disease',
    name: 'Marburg virus disease',
    category: 'Viral outbreak tracker',
    summary: 'A rare but severe viral hemorrhagic fever threat requiring rapid case detection, isolation, and contact tracing.',
    mortalityRate: 50,
    infectionRate: 0.01,
    recoveryRate: 47,
    totalDeaths: 12,
    totalCases: 24,
    activeOutbreaks: 1,
    affectedRegions: ['Africa'],
    trend: 'flat',
    source: 'WHO Disease Outbreak News fallback',
    countries: [
      { iso: 'TZA', country: 'Tanzania', region: 'Africa', latitude: -6.369, longitude: 34.8888, severity: 'high', mortalityRate: 48, infectionRate: 0.04, recoveryRate: 50, totalDeaths: 6, totalCases: 12, activeOutbreaks: 1 },
      { iso: 'GNQ', country: 'Equatorial Guinea', region: 'Africa', latitude: 1.6508, longitude: 10.2679, severity: 'high', mortalityRate: 52, infectionRate: 0.03, recoveryRate: 45, totalDeaths: 6, totalCases: 12, activeOutbreaks: 0 }
    ],
    series: [
      { date: '2021', mortalityRate: 50, totalDeaths: 0, totalCases: 0 },
      { date: '2022', mortalityRate: 50, totalDeaths: 2, totalCases: 4 },
      { date: '2023', mortalityRate: 52, totalDeaths: 18, totalCases: 35 },
      { date: '2024', mortalityRate: 50, totalDeaths: 12, totalCases: 24 }
    ]
  },
  {
    id: 'zika',
    slug: 'zika-virus',
    name: 'Zika virus',
    category: 'Viral outbreak tracker',
    summary: 'A mosquito-borne viral threat monitored for congenital complications, travel-associated spread, and regional transmission clusters.',
    mortalityRate: 0.01,
    infectionRate: 14,
    recoveryRate: 99.5,
    totalDeaths: 25,
    totalCases: 42000,
    activeOutbreaks: 6,
    affectedRegions: ['South America', 'North America', 'Asia'],
    trend: 'flat',
    source: 'WHO arbovirus fallback sample',
    countries: [
      { iso: 'BRA', country: 'Brazil', region: 'South America', latitude: -14.235, longitude: -51.9253, severity: 'moderate', mortalityRate: 0.01, infectionRate: 35, recoveryRate: 99.5, totalDeaths: 12, totalCases: 18000, activeOutbreaks: 2 },
      { iso: 'COL', country: 'Colombia', region: 'South America', latitude: 4.5709, longitude: -74.2973, severity: 'moderate', mortalityRate: 0.01, infectionRate: 24, recoveryRate: 99.5, totalDeaths: 5, totalCases: 9000, activeOutbreaks: 1 },
      { iso: 'THA', country: 'Thailand', region: 'Asia', latitude: 15.87, longitude: 100.9925, severity: 'low', mortalityRate: 0.01, infectionRate: 7, recoveryRate: 99.6, totalDeaths: 1, totalCases: 1200, activeOutbreaks: 1 }
    ],
    series: [
      { date: '2021', mortalityRate: 0.01, totalDeaths: 18, totalCases: 36000 },
      { date: '2022', mortalityRate: 0.01, totalDeaths: 20, totalCases: 38000 },
      { date: '2023', mortalityRate: 0.01, totalDeaths: 22, totalCases: 40000 },
      { date: '2024', mortalityRate: 0.01, totalDeaths: 25, totalCases: 42000 }
    ]
  },
  {
    id: 'mers-cov',
    slug: 'mers-cov',
    name: 'MERS-CoV',
    category: 'Viral outbreak tracker',
    summary: 'A coronavirus threat with sporadic zoonotic and healthcare-associated clusters, monitored for high case fatality despite limited transmission.',
    mortalityRate: 34,
    infectionRate: 0.02,
    recoveryRate: 64,
    totalDeaths: 940,
    totalCases: 2600,
    activeOutbreaks: 2,
    affectedRegions: ['Asia'],
    trend: 'flat',
    source: 'WHO Disease Outbreak News fallback',
    countries: [
      { iso: 'SAU', country: 'Saudi Arabia', region: 'Asia', latitude: 23.8859, longitude: 45.0792, severity: 'high', mortalityRate: 35, infectionRate: 0.12, recoveryRate: 63, totalDeaths: 870, totalCases: 2500, activeOutbreaks: 2 },
      { iso: 'ARE', country: 'United Arab Emirates', region: 'Asia', latitude: 23.4241, longitude: 53.8478, severity: 'moderate', mortalityRate: 32, infectionRate: 0.03, recoveryRate: 65, totalDeaths: 20, totalCases: 60, activeOutbreaks: 0 },
      { iso: 'KOR', country: 'South Korea', region: 'Asia', latitude: 35.9078, longitude: 127.7669, severity: 'low', mortalityRate: 20, infectionRate: 0.01, recoveryRate: 80, totalDeaths: 38, totalCases: 186, activeOutbreaks: 0 }
    ],
    series: [
      { date: '2021', mortalityRate: 34, totalDeaths: 880, totalCases: 2550 },
      { date: '2022', mortalityRate: 34, totalDeaths: 900, totalCases: 2570 },
      { date: '2023', mortalityRate: 34, totalDeaths: 920, totalCases: 2590 },
      { date: '2024', mortalityRate: 34, totalDeaths: 940, totalCases: 2600 }
    ]
  }
];

function buildCountries(diseases: Disease[]): CountryMetric[] {
  const byIso = new Map<string, CountryMetric>();
  for (const item of diseases) {
    for (const country of item.countries) {
      const existing = byIso.get(country.iso);
      if (!existing || (country.totalDeaths.value ?? 0) > (existing.totalDeaths.value ?? 0)) byIso.set(country.iso, country);
    }
  }
  return Array.from(byIso.values()).sort((a, b) => (b.totalDeaths.value ?? 0) - (a.totalDeaths.value ?? 0));
}

function buildTop10(diseases: Disease[]): TopDisease[] {
  return [...diseases]
    .sort((a, b) => (b.mortalityRate.value ?? -1) - (a.mortalityRate.value ?? -1))
    .slice(0, 10)
    .map((item, index) => ({
      rank: index + 1,
      diseaseId: item.id,
      slug: item.slug,
      name: item.name,
      mortalityRate: item.mortalityRate.value ?? 0,
      totalDeaths: item.totalDeaths.value ?? 0,
      affectedRegions: item.affectedRegions,
      trend: item.trend,
      lastUpdated: item.lastUpdated,
      quality: item.mortalityRate.quality
    }));
}

const news: OutbreakNews[] = [
  { id: 'don-covid-19', headline: 'COVID-19 variant and hospitalization surveillance remains active globally', source: 'WHO/OWID fallback', publishedAt: generatedAt, affectedCountry: 'Global', affectedRegion: 'Global', url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019', severity: 'watch' },
  { id: 'don-dengue-brazil', headline: 'Dengue pressure elevated across Brazil and neighboring countries', source: 'WHO arbovirus fallback', publishedAt: generatedAt, affectedCountry: 'Brazil', affectedRegion: 'South America', url: 'https://www.who.int/emergencies/disease-outbreak-news', severity: 'advisory' },
  { id: 'don-mpox-drc', headline: 'Mpox monitoring remains elevated in central Africa', source: 'WHO Disease Outbreak News fallback', publishedAt: generatedAt, affectedCountry: 'Democratic Republic of the Congo', affectedRegion: 'Africa', url: 'https://www.who.int/emergencies/disease-outbreak-news', severity: 'emergency' },
  { id: 'don-cholera-yemen', headline: 'Cholera risk remains tied to water and sanitation disruption', source: 'WHO Disease Outbreak News fallback', publishedAt: generatedAt, affectedCountry: 'Yemen', affectedRegion: 'Asia', url: 'https://www.who.int/emergencies/disease-outbreak-news', severity: 'advisory' }
];

const metadata: Metadata = {
  generatedAt,
  mortalityRefreshHours: 12,
  outbreakRefreshHours: 1,
  status: 'fallback',
  warnings: [
    'Expanded fallback dataset includes estimated noncommunicable disease burden and monitored outbreak samples.',
    'Live source coverage varies by disease. Unavailable fields are explicitly marked unavailable; recovery rates are mocked only where shown.'
  ],
  sources: [
    { name: 'WHO Global Health Estimates', url: 'https://www.who.int/data/gho', cadence: 'Periodic source updates; dashboard refreshes mortality indicators every 12 hours.' },
    { name: 'Our World in Data Grapher', url: 'https://ourworldindata.org/grapher', cadence: 'Dataset-dependent periodic updates.' },
    { name: 'WHO Disease Outbreak News', url: 'https://www.who.int/emergencies/disease-outbreak-news', cadence: 'Dashboard checks hourly.' }
  ]
};

async function writeJson(fileName: string, value: unknown) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, fileName), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function main() {
  const diseases = seeds.map(disease);
  await writeJson('diseases.json', diseases);
  await writeJson('countries.json', buildCountries(diseases));
  await writeJson('top10.json', buildTop10(diseases));
  await writeJson('outbreak-news.json', news);
  await writeJson('metadata.json', metadata);
  console.log(`Seeded ${diseases.length} NateEyeView disease and outbreak records.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
