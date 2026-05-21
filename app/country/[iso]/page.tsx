import Link from 'next/link';
import { notFound } from 'next/navigation';
import Shell from '@/components/Shell';
import QualityBadge from '@/components/QualityBadge';
import { getCountry, getDashboardData } from '@/lib/data';
import { metricLabels, severityColors } from '@/lib/constants';
import { formatMetric } from '@/lib/format';
import type { MetricKey } from '@/lib/types';

const metricKeys = Object.keys(metricLabels) as MetricKey[];

export function generateStaticParams() {
  return getDashboardData().countries.map((country) => ({ iso: country.iso }));
}

export default function CountryPage({ params }: { params: { iso: string } }) {
  const country = getCountry(params.iso);
  if (!country) notFound();

  return (
    <Shell>
      <article className="mx-auto grid max-w-5xl gap-4">
        <section className="glass rounded-lg p-6">
          <Link href="/" className="text-sm font-semibold text-cyan hover:text-white">Back to dashboard</Link>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="panel-title">{country.region}</p>
              <h1 className="mt-2 text-4xl font-black text-white">{country.country}</h1>
              <p className="mt-3 text-slate-300">Country-level surveillance snapshot from the normalized NateEyeView dataset.</p>
            </div>
            <span className="rounded-md border px-3 py-2 text-sm font-bold capitalize" style={{ borderColor: severityColors[country.severity], color: severityColors[country.severity] }}>
              {country.severity} severity
            </span>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricKeys.map((key) => (
            <div key={key} className="glass rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="panel-title">{metricLabels[key]}</p>
                <QualityBadge value={country[key].quality} />
              </div>
              <p className="mt-3 text-3xl font-black">{formatMetric(country[key])}</p>
              <p className="mt-2 text-sm text-slate-400">{country[key].source}</p>
            </div>
          ))}
        </section>
      </article>
    </Shell>
  );
}
