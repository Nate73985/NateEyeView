'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Biohazard,
  Clock3,
  Crosshair,
  Globe2,
  Radio,
  Search,
  ShieldCheck,
  Skull,
  Users
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Shell from './Shell';
import MapPanel from './MapPanel';
import KpiCard from './KpiCard';
import QualityBadge from './QualityBadge';
import { metricLabels, regions, severityColors } from '@/lib/constants';
import { formatMetric, formatNumber, formatRate, formatTimestamp } from '@/lib/format';
import type { CountryMetric, DashboardData, MetricKey, Region } from '@/lib/types';

type UnitMode = 'actual' | 'percent' | 'per100k';

const metricKeys = Object.keys(metricLabels) as MetricKey[];

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-danger" aria-label="Increasing trend" />;
  if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-success" aria-label="Decreasing trend" />;
  return <ArrowRight className="h-4 w-4 text-slate-300" aria-label="Flat trend" />;
}

function unitValue(country: CountryMetric, metric: MetricKey, mode: UnitMode) {
  const value = country[metric].value;
  if (value === null) return 'Unavailable';
  if (mode === 'percent') return metric.includes('Rate') ? formatRate(value) : `${Math.min(100, value / 1000000).toFixed(2)}%`;
  if (mode === 'per100k') return metric === 'infectionRate' || country[metric].unit === 'per100k' ? `${value.toLocaleString()} / 100k` : `${(value / 1000).toFixed(2)} / 100k`;
  return formatMetric(country[metric]);
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const [diseaseSlug, setDiseaseSlug] = useState(data.diseases[0]?.slug ?? '');
  const [metric, setMetric] = useState<MetricKey>('mortalityRate');
  const [mode, setMode] = useState<UnitMode>('actual');
  const [region, setRegion] = useState<Region>('Global');
  const [query, setQuery] = useState('');
  const [selectedIso, setSelectedIso] = useState<string | undefined>();

  const disease = data.diseases.find((item) => item.slug === diseaseSlug) ?? data.diseases[0];
  if (!disease) {
    return (
      <Shell>
        <div className="glass rounded-lg p-8 text-center text-slate-300">No disease data is available. Run npm run fetch:data and rebuild the dashboard.</div>
      </Shell>
    );
  }

  const sourceCountries = disease.countries.length ? disease.countries : data.countries;
  const countries = sourceCountries.filter((country) => {
    const regionMatch = region === 'Global' || country.region === region;
    const queryMatch = `${country.country} ${disease.name}`.toLowerCase().includes(query.toLowerCase());
    return regionMatch && queryMatch;
  });

  const selectedCountry = countries.find((country) => country.iso === selectedIso) ?? countries[0];
  const comparison = countries.slice(0, 8).map((country) => ({ country: country.iso, value: country[metric].value ?? 0 }));
  const highestCountry = countries.reduce<CountryMetric | undefined>((leader, country) => {
    if (!leader) return country;
    return (country[metric].value ?? 0) > (leader[metric].value ?? 0) ? country : leader;
  }, undefined);
  const metricSnapshot = [
    { label: 'Mortality', key: 'mortalityRate' as MetricKey, value: formatMetric(disease.mortalityRate), quality: disease.mortalityRate.quality },
    { label: 'Infections', key: 'infectionRate' as MetricKey, value: formatMetric(disease.infectionRate), quality: disease.infectionRate.quality },
    { label: 'Deaths', key: 'totalDeaths' as MetricKey, value: formatMetric(disease.totalDeaths), quality: disease.totalDeaths.quality },
    { label: 'Outbreaks', key: 'activeOutbreaks' as MetricKey, value: formatMetric(disease.activeOutbreaks), quality: disease.activeOutbreaks.quality }
  ];

  return (
    <Shell>
      <div className="grid items-start gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_24rem] 3xl:grid-cols-[22rem_minmax(0,1fr)_28rem]">
        <aside className="glass rounded-lg p-4 xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
          <p className="panel-title">Command filters</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Disease or condition</span>
              <select className="control" value={diseaseSlug} onChange={(event) => setDiseaseSlug(event.target.value)}>
                {data.diseases.map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Metric</span>
              <select className="control" value={metric} onChange={(event) => setMetric(event.target.value as MetricKey)}>
                {metricKeys.map((key) => (
                  <option key={key} value={key}>
                    {metricLabels[key]}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="grid gap-2">
              <legend className="text-sm text-slate-300">Display mode</legend>
              <div className="grid grid-cols-3 gap-1 rounded-md border border-line bg-slate-950/50 p-1">
                {(['actual', 'percent', 'per100k'] as UnitMode[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`rounded px-2 py-2 text-xs font-bold uppercase ${mode === item ? 'bg-cyan text-slate-950' : 'text-slate-300 hover:bg-white/8'}`}
                    onClick={() => setMode(item)}
                  >
                    {item === 'per100k' ? 'Per 100k' : item === 'percent' ? 'Percent' : 'Actual'}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Region</span>
              <select className="control" value={region} onChange={(event) => setRegion(event.target.value as Region)}>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Search</span>
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" aria-hidden />
                <input className="control w-full pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Country or disease" />
              </span>
            </label>
          </div>
          <div className="mt-6 rounded-lg border border-line bg-slate-950/45 p-3">
            <p className="panel-title">Severity legend</p>
            <div className="mt-3 grid gap-2">
              {Object.entries(severityColors).map(([label, color]) => (
                <div key={label} className="flex items-center justify-between text-sm text-slate-300">
                  <span className="flex items-center gap-2 capitalize">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                    {label}
                  </span>
                  <span className="text-xs text-slate-500">risk tier</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid min-w-0 gap-4">
          <section className="signal-console rounded-lg p-4 md:p-5">
            <div className="relative z-10 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_24rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="status-pulse inline-flex items-center gap-2 rounded-md border border-danger/45 bg-danger/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-red-100">
                    <Radio className="h-4 w-4" aria-hidden />
                    Live watch
                  </span>
                  <span className="rounded-md border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-cyan">
                    {data.metadata.status === 'live' ? 'Public feeds online' : 'Fallback mode'}
                  </span>
                  <span className="rounded-md border border-line bg-slate-950/55 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    Last updated {formatTimestamp(data.metadata.generatedAt)}
                  </span>
                </div>
                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                  <div>
                    <p className="panel-title">Selected signal</p>
                    <h1 className="mt-2 text-4xl font-black leading-none tracking-wide text-white sm:text-5xl">{disease.name}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{disease.summary}</p>
                  </div>
                  <div className="rounded-lg border border-cyan/20 bg-slate-950/55 p-4">
                    <p className="panel-title">Current focus</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-400">{metricLabels[metric]}</p>
                        <p className="mt-1 text-3xl font-black text-white">{formatMetric(disease[metric])}</p>
                      </div>
                      <Crosshair className="h-9 w-9 text-cyan" aria-hidden />
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan via-amber to-danger" style={{ width: `${Math.min(100, Math.max(12, disease.mortalityRate.value ?? 0))}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {metricSnapshot.map((item) => (
                    <button key={item.label} type="button" className="metric-tile rounded-lg p-4 text-left transition hover:-translate-y-0.5 hover:border-cyan/50" onClick={() => setMetric(item.key)}>
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</span>
                      <span className="mt-2 block text-2xl font-black text-white">{item.value}</span>
                      <span className="mt-2 block text-xs capitalize text-slate-500">{item.quality}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Disease quick selector">
                  {data.top10.map((item) => (
                    <button
                      key={item.diseaseId}
                      type="button"
                      onClick={() => setDiseaseSlug(item.slug)}
                      className={`shrink-0 rounded-md border px-3 py-2 text-left text-sm transition ${
                        item.slug === disease.slug ? 'border-cyan bg-cyan/15 text-white shadow-glow' : 'border-line bg-slate-950/45 text-slate-300 hover:border-cyan/50'
                      }`}
                    >
                      <span className="font-black text-cyan">#{item.rank}</span> {item.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="panel-title">Live outbreak ticker</p>
                  <span className="rounded bg-danger px-2 py-1 text-[11px] font-black uppercase tracking-wide text-white">Hourly</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {data.news.map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="news-card rounded-md border border-danger/25 p-3 transition hover:border-cyan/60">
                      <span className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-amber">
                        {item.affectedCountry}
                        <span className="text-slate-500">{item.severity}</span>
                      </span>
                      <h2 className="mt-1 text-sm font-bold leading-5 text-white">{item.headline}</h2>
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden />
                        {formatTimestamp(item.publishedAt)}
                      </p>
                    </a>
                  ))}
                </div>
                <div className="mt-4 rounded-md border border-line bg-slate-950/45 p-3">
                  <p className="panel-title">Highest visible country</p>
                  <button type="button" className="mt-2 flex w-full items-center justify-between gap-3 text-left" onClick={() => highestCountry && setSelectedIso(highestCountry.iso)}>
                    <span>
                      <span className="block text-lg font-black text-white">{highestCountry?.country ?? 'Unavailable'}</span>
                      <span className="text-sm text-slate-400">{highestCountry ? unitValue(highestCountry, metric, mode) : 'No country selected'}</span>
                    </span>
                    <Globe2 className="h-5 w-5 text-cyan" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            <KpiCard label="Global mortality signal" value={formatMetric(disease.mortalityRate)} detail={disease.name} icon={Skull} />
            <KpiCard label="Total deaths tracked" value={formatNumber(disease.totalDeaths.value)} detail={disease.totalDeaths.quality} icon={AlertTriangle} />
            <KpiCard label="Total cases tracked" value={formatNumber(disease.totalCases.value)} detail={disease.totalCases.quality} icon={Users} />
            <KpiCard label="Active outbreaks" value={formatNumber(disease.activeOutbreaks.value)} detail="hourly news scan" icon={Biohazard} />
          </div>

          <section className="glass rounded-lg p-4 ring-1 ring-cyan/10">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="panel-title">Interactive world risk map</p>
                <h2 className="mt-2 text-2xl font-black tracking-wide text-white md:text-4xl">Global disease surveillance</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-400">Color-coded severity markers support zoom, hover popups, and click-to-filter country inspection.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <QualityBadge value={disease.mortalityRate.quality} />
                <span>Last updated {formatTimestamp(disease.lastUpdated)}</span>
              </div>
            </div>
            {countries.length ? (
              <MapPanel countries={countries} metric={metric} selectedIso={selectedIso} onSelect={(country) => setSelectedIso(country.iso)} />
            ) : (
              <div className="grid h-[440px] place-items-center rounded-lg border border-line bg-slate-950/60 text-slate-400">No matching countries found.</div>
            )}
          </section>

          <div className="grid gap-4 2xl:grid-cols-2">
            <section className="glass rounded-lg p-4">
              <p className="panel-title">Mortality time series</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={disease.series}>
                    <CartesianGrid stroke="rgba(148,163,184,.16)" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#08101d', border: '1px solid rgba(148,163,184,.25)', color: '#fff' }} />
                    <Line type="monotone" dataKey="mortalityRate" stroke="#24d7ff" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="glass rounded-lg p-4">
              <p className="panel-title">Country comparison</p>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparison}>
                    <CartesianGrid stroke="rgba(148,163,184,.16)" />
                    <XAxis dataKey="country" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: '#08101d', border: '1px solid rgba(148,163,184,.25)', color: '#fff' }} />
                    <Bar dataKey="value" fill="#f8b84e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <section className="glass overflow-hidden rounded-lg">
            <div className="flex items-center justify-between border-b border-line p-4">
              <div>
                <p className="panel-title">Top 10 global mortality ranking</p>
                <p className="mt-1 text-sm text-slate-400">Click a disease to update the dashboard.</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-success" aria-hidden />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Rank</th>
                    <th className="px-4 py-3">Disease</th>
                    <th className="px-4 py-3">Mortality</th>
                    <th className="px-4 py-3">Deaths</th>
                    <th className="px-4 py-3">Regions</th>
                    <th className="px-4 py-3">Trend</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.top10.map((item) => (
                    <tr key={item.diseaseId} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-black text-cyan">#{item.rank}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setDiseaseSlug(item.slug)} className="font-semibold text-white hover:text-cyan">
                          {item.name}
                        </button>
                      </td>
                      <td className="px-4 py-3">{formatRate(item.mortalityRate)}</td>
                      <td className="px-4 py-3">{formatNumber(item.totalDeaths)}</td>
                      <td className="px-4 py-3 text-slate-300">{item.affectedRegions.join(', ')}</td>
                      <td className="px-4 py-3">
                        <TrendIcon trend={item.trend} />
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatTimestamp(item.lastUpdated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>

        <aside className="grid gap-4 xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <section className="glass rounded-lg p-4">
            <p className="panel-title">Disease profile</p>
            <h2 className="mt-2 text-2xl font-black text-white">{disease.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{disease.summary}</p>
            <div className="mt-4 grid gap-3">
              {metricKeys.map((key) => (
                <button key={key} type="button" onClick={() => setMetric(key)} className={`flex items-center justify-between gap-3 rounded-md border p-3 text-left transition ${metric === key ? 'border-cyan bg-cyan/10' : 'border-line bg-slate-950/45 hover:border-cyan/40'}`}>
                  <span className="text-sm text-slate-400">{metricLabels[key]}</span>
                  <span className="text-right text-sm font-bold text-white">{formatMetric(disease[key])}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="glass rounded-lg p-4">
            <p className="panel-title">Country inspection</p>
            {selectedCountry ? (
              <div className="mt-3">
                <Link href={`/country/${selectedCountry.iso}`} className="flex items-center justify-between text-xl font-black text-white hover:text-cyan">
                  {selectedCountry.country}
                  <Globe2 className="h-5 w-5" aria-hidden />
                </Link>
                <p className="mt-1 text-sm text-slate-400">{selectedCountry.region}</p>
                <div className="mt-4 grid gap-2">
                  <div className="rounded-md border border-line bg-slate-950/45 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500">{metricLabels[metric]}</p>
                    <p className="mt-1 text-2xl font-black">{unitValue(selectedCountry, metric, mode)}</p>
                  </div>
                  <QualityBadge value={selectedCountry[metric].quality} />
                  <div className="grid gap-2">
                    {countries.slice(0, 5).map((country) => (
                      <button
                        key={country.iso}
                        type="button"
                        onClick={() => setSelectedIso(country.iso)}
                        className={`flex items-center justify-between rounded-md border p-2 text-left text-sm transition ${
                          selectedCountry.iso === country.iso ? 'border-cyan bg-cyan/10 text-white' : 'border-line bg-slate-950/35 text-slate-300 hover:border-cyan/40'
                        }`}
                      >
                        <span>{country.country}</span>
                        <span className="font-bold">{unitValue(country, metric, mode)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Select a country marker to inspect details.</p>
            )}
          </section>

          <section className="glass rounded-lg p-4">
            <div className="flex items-center justify-between">
              <p className="panel-title">News Flash</p>
              <span className="status-pulse rounded bg-danger px-2 py-1 text-[11px] font-black uppercase tracking-wide text-white">Hourly</span>
            </div>
            <div className="mt-4 grid gap-3">
              {data.news.map((item) => (
                <a key={item.id} href={item.url} className="rounded-md border border-line bg-slate-950/45 p-3 transition hover:border-cyan/50" target="_blank" rel="noreferrer">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-amber">{item.source}</span>
                  <h3 className="mt-1 text-sm font-bold leading-5 text-white">{item.headline}</h3>
                  <p className="mt-2 text-xs text-slate-400">
                    {item.affectedCountry} - {formatTimestamp(item.publishedAt)}
                  </p>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </Shell>
  );
}
