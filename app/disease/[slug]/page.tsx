import Link from 'next/link';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import QualityBadge from '@/components/QualityBadge';
import { getDashboardData, getDisease } from '@/lib/data';
import { metricLabels } from '@/lib/constants';
import { formatMetric, formatTimestamp } from '@/lib/format';
import type { MetricKey } from '@/lib/types';

const metricKeys = Object.keys(metricLabels) as MetricKey[];

export function generateStaticParams() {
  return getDashboardData().diseases.map((disease) => ({ slug: disease.slug }));
}

export default function DiseasePage({ params }: { params: { slug: string } }) {
  const disease = getDisease(params.slug);
  if (!disease) notFound();

  return (
    <Shell>
      <article className="mx-auto grid max-w-6xl gap-4">
        <section className="glass rounded-lg p-6">
          <Link href="/" className="text-sm font-semibold text-cyan hover:text-white">Back to dashboard</Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="panel-title">{disease.category}</p>
              <h1 className="mt-2 text-4xl font-black text-white">{disease.name}</h1>
              <p className="mt-3 max-w-3xl leading-7 text-slate-300">{disease.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <QualityBadge value={disease.mortalityRate.quality} />
              <span className="rounded border border-line bg-slate-950/50 px-3 py-1 text-xs text-slate-300">Updated {formatTimestamp(disease.lastUpdated)}</span>
            </div>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricKeys.map((key) => (
            <div key={key} className="glass rounded-lg p-4">
              <p className="panel-title">{metricLabels[key]}</p>
              <p className="mt-3 text-3xl font-black">{formatMetric(disease[key])}</p>
              <p className="mt-2 text-sm text-slate-400">{disease[key].source}</p>
            </div>
          ))}
        </section>
        <section className="glass rounded-lg p-4">
          <p className="panel-title">Affected countries in current dataset</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {disease.countries.map((country) => (
              <Link key={country.iso} href={`/country/${country.iso}`} className="rounded-md border border-line bg-slate-950/45 p-4 transition hover:border-cyan/50">
                <span className="text-lg font-bold text-white">{country.country}</span>
                <span className="ml-3 text-sm text-slate-400">{country.region}</span>
                <p className="mt-2 text-sm text-slate-300">Mortality: {formatMetric(country.mortalityRate)}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </Shell>
  );
}
