import Shell from '@/components/Shell';
import { getDashboardData } from '@/lib/data';
import { formatTimestamp } from '@/lib/format';

export default function MethodologyPage() {
  const { metadata } = getDashboardData();

  return (
    <Shell>
      <article className="mx-auto max-w-5xl">
        <section className="glass rounded-lg p-6">
          <p className="panel-title">Methodology</p>
          <h1 className="mt-2 text-4xl font-black text-white">How NateEyeView reads global health signals</h1>
          <p className="mt-4 leading-7 text-slate-300">
            NateEyeView is an educational and research dashboard. It is not medical advice, a clinical decision system, or an emergency notification service.
            Mortality datasets are generally released periodically, so the dashboard refreshes mortality data every 12 hours and displays the latest available timestamp.
            Outbreak/news feeds are checked hourly.
          </p>
        </section>
        <section className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            ['Mortality rate', 'Deaths divided by reported or estimated cases for a condition, expressed as a percentage where source data supports it.'],
            ['Infection rate', 'Reported or estimated infections normalized as a rate, typically per 100,000 population.'],
            ['Recovery rate', 'Recovered cases divided by known cases. This is marked mocked where public APIs do not publish consistent values.'],
            ['Case fatality rate', 'Deaths among confirmed cases, often source-dependent and sensitive to testing and reporting coverage.'],
            ['Deaths per 100,000', 'Deaths normalized by population to make countries with different population sizes easier to compare.'],
            ['Active outbreak', 'A currently monitored outbreak signal from WHO Disease Outbreak News or normalized public-health alerts.']
          ].map(([title, body]) => (
            <div key={title} className="glass rounded-lg p-4">
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </div>
          ))}
        </section>
        <section className="glass mt-4 rounded-lg p-6">
          <h2 className="text-xl font-black text-white">Sources and cadence</h2>
          <p className="mt-2 text-sm text-slate-400">Last generated {formatTimestamp(metadata.generatedAt)}</p>
          <div className="mt-4 grid gap-3">
            {metadata.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="rounded-md border border-line bg-slate-950/45 p-4 transition hover:border-cyan/50">
                <span className="font-bold text-white">{source.name}</span>
                <p className="mt-1 text-sm text-slate-400">{source.cadence}</p>
              </a>
            ))}
          </div>
        </section>
      </article>
    </Shell>
  );
}
