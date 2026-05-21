import diseases from '@/public/data/diseases.json';
import countries from '@/public/data/countries.json';
import top10 from '@/public/data/top10.json';
import news from '@/public/data/outbreak-news.json';
import metadata from '@/public/data/metadata.json';
import type { CountryMetric, DashboardData, Disease, Metadata, OutbreakNews, TopDisease } from './types';

export function getDashboardData(): DashboardData {
  return {
    diseases: diseases as Disease[],
    countries: countries as CountryMetric[],
    top10: top10 as TopDisease[],
    news: news as OutbreakNews[],
    metadata: metadata as Metadata
  };
}

export function getDisease(slug: string): Disease | undefined {
  return (diseases as Disease[]).find((disease) => disease.slug === slug);
}

export function getCountry(iso: string): CountryMetric | undefined {
  return (countries as CountryMetric[]).find((country) => country.iso.toLowerCase() === iso.toLowerCase());
}
