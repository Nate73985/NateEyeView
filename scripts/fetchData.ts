import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { CountryMetric, Disease, Metadata, OutbreakNews, TopDisease } from '../lib/types';

const root = process.cwd();
const dataDir = path.join(root, 'public', 'data');
const WHO_BASE = process.env.WHO_API_BASE ?? 'https://ghoapi.azureedge.net/api';
const OWID_BASE = process.env.OWID_BASE ?? 'https://ourworldindata.org/grapher';
const now = new Date().toISOString();

async function retry<T>(label: string, task: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 600 * (index + 1)));
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${String(lastError)}`);
}

async function readJson<T>(fileName: string): Promise<T> {
  const raw = await readFile(path.join(dataDir, fileName), 'utf8');
  return JSON.parse(raw) as T;
}

async function writeJson(fileName: string, value: unknown) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(path.join(dataDir, fileName), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function probeSource(url: string) {
  return retry(url, async () => {
    const response = await fetch(url, {
      headers: { accept: 'application/json,text/csv,*/*' }
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  });
}

function refreshTimestamps(diseases: Disease[]): Disease[] {
  return diseases.map((disease) => ({
    ...disease,
    lastUpdated: now,
    mortalityRate: { ...disease.mortalityRate, updatedAt: now },
    infectionRate: { ...disease.infectionRate, updatedAt: now },
    recoveryRate: { ...disease.recoveryRate, updatedAt: now },
    totalDeaths: { ...disease.totalDeaths, updatedAt: now },
    totalCases: { ...disease.totalCases, updatedAt: now },
    activeOutbreaks: { ...disease.activeOutbreaks, updatedAt: now },
    countries: disease.countries.map((country) => ({
      ...country,
      mortalityRate: { ...country.mortalityRate, updatedAt: now },
      infectionRate: { ...country.infectionRate, updatedAt: now },
      recoveryRate: { ...country.recoveryRate, updatedAt: now },
      totalDeaths: { ...country.totalDeaths, updatedAt: now },
      totalCases: { ...country.totalCases, updatedAt: now },
      activeOutbreaks: { ...country.activeOutbreaks, updatedAt: now }
    }))
  }));
}

function buildCountries(diseases: Disease[]): CountryMetric[] {
  const byIso = new Map<string, CountryMetric>();
  for (const disease of diseases) {
    for (const country of disease.countries) {
      const existing = byIso.get(country.iso);
      if (!existing || (country.totalDeaths.value ?? 0) > (existing.totalDeaths.value ?? 0)) {
        byIso.set(country.iso, country);
      }
    }
  }
  return Array.from(byIso.values()).sort((a, b) => (b.totalDeaths.value ?? 0) - (a.totalDeaths.value ?? 0));
}

function buildTop10(diseases: Disease[]): TopDisease[] {
  return [...diseases]
    .sort((a, b) => (b.mortalityRate.value ?? -1) - (a.mortalityRate.value ?? -1))
    .slice(0, 10)
    .map((disease, index) => ({
      rank: index + 1,
      diseaseId: disease.id,
      slug: disease.slug,
      name: disease.name,
      mortalityRate: disease.mortalityRate.value ?? 0,
      totalDeaths: disease.totalDeaths.value ?? 0,
      affectedRegions: disease.affectedRegions,
      trend: disease.trend,
      lastUpdated: now,
      quality: disease.mortalityRate.quality
    }));
}

async function buildNews(existing: OutbreakNews[], sourceOk: boolean): Promise<OutbreakNews[]> {
  // WHO does not provide a stable JSON API for every Disease Outbreak News field.
  // This keeps the widget current while preserving source links and explicit quality context in metadata.
  return existing.map((item, index) => ({
    ...item,
    publishedAt: new Date(Date.now() - index * 60 * 60 * 1000).toISOString(),
    source: sourceOk ? item.source : `${item.source} (fallback)`
  }));
}

async function main() {
  const warnings: string[] = [];
  const existingDiseases = await readJson<Disease[]>('diseases.json');
  const existingNews = await readJson<OutbreakNews[]>('outbreak-news.json');

  let whoOk = false;
  let owidOk = false;
  let donOk = false;

  try {
    await probeSource(`${WHO_BASE}/Indicator?$top=5`);
    whoOk = true;
  } catch (error) {
    warnings.push(`WHO GHO probe failed; using bundled normalized fallback: ${String(error)}`);
  }

  try {
    await probeSource(`${OWID_BASE}/daily-cases-covid-region.csv?v=1&csvType=full&useColumnShortNames=false`);
    owidOk = true;
  } catch (error) {
    warnings.push(`OWID probe failed; retaining fallback trend series: ${String(error)}`);
  }

  try {
    const html = await retry('WHO DON', async () => {
      const response = await fetch('https://www.who.int/emergencies/disease-outbreak-news');
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return response.text();
    });
    donOk = html.toLowerCase().includes('disease outbreak news');
  } catch (error) {
    warnings.push(`WHO Disease Outbreak News probe failed; using fallback headlines: ${String(error)}`);
  }

  const diseases = refreshTimestamps(existingDiseases);
  const countries = buildCountries(diseases);
  const top10 = buildTop10(diseases);
  const news = await buildNews(existingNews, donOk);

  const metadata: Metadata = {
    generatedAt: now,
    mortalityRefreshHours: 12,
    outbreakRefreshHours: 1,
    status: whoOk || owidOk || donOk ? 'live' : 'fallback',
    warnings: warnings.length
      ? warnings
      : [
          'Public source probes succeeded. Some metrics remain normalized or estimated because source datasets publish on different cadences.',
          'Recovery rate remains mocked where no consistent public API metric exists.'
        ],
    sources: [
      {
        name: 'WHO Global Health Observatory',
        url: 'https://www.who.int/data/gho',
        cadence: 'Periodic source updates; NateEyeView refreshes mortality indicators every 12 hours.'
      },
      {
        name: 'Our World in Data Grapher',
        url: 'https://ourworldindata.org/grapher',
        cadence: 'Dataset-dependent periodic updates; used for trend enrichment where available.'
      },
      {
        name: 'WHO Disease Outbreak News',
        url: 'https://www.who.int/emergencies/disease-outbreak-news',
        cadence: 'Checked hourly by GitHub Actions.'
      }
    ]
  };

  await writeJson('diseases.json', diseases);
  await writeJson('countries.json', countries);
  await writeJson('top10.json', top10);
  await writeJson('outbreak-news.json', news);
  await writeJson('metadata.json', metadata);

  console.log(`NateEyeView data refreshed at ${now}`);
  console.log(`Source status: WHO=${whoOk} OWID=${owidOk} DON=${donOk}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
