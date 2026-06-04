/* eslint-disable @next/next/no-img-element */
import { Activity, BarChart3, DatabaseZap, Globe2, GraduationCap, Radar, ShieldCheck, UserRound } from 'lucide-react';
import Shell from '@/components/Shell';

const stats = [
  { label: 'Global Coverage', value: 'Worldwide', detail: 'Country-level indicators and regional signal views.', icon: Globe2 },
  { label: 'Outbreak Monitoring', value: 'Hourly', detail: 'News and outbreak feeds refreshed when sources are available.', icon: Radar },
  { label: 'Mortality Insights', value: 'Ranked', detail: 'Disease burden and mortality signals organized for research.', icon: BarChart3 },
  { label: 'Research Ready', value: 'Labeled', detail: 'Estimated, stale, unavailable, and fallback data are flagged.', icon: ShieldCheck }
];

const sources = [
  'World Health Organization Global Health Observatory',
  'WHO Disease Outbreak News',
  'Our World in Data',
  'Global public health datasets and country-level indicators',
  'News or outbreak feeds where available'
];

export default function AboutPage() {
  return (
    <Shell>
      <article className="mx-auto grid max-w-7xl gap-5">
        <section className="signal-console rounded-lg p-4 sm:p-6 lg:p-8">
          <div className="relative z-10 grid gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:items-start">
            <div className="mx-auto w-full max-w-[16rem] rounded-lg border border-cyan/25 bg-slate-950/55 p-3 shadow-glow lg:mx-0">
              <div className="relative overflow-hidden rounded-md border border-white/10 bg-slate-900/80">
                <img
                  src="../images/nate-headshot.png"
                  alt="Nathaniel Okafor, founder and researcher behind NateEyeView"
                  width={640}
                  height={760}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-cyan/10" />
              </div>
              <div className="mt-3 rounded-md border border-line bg-slate-950/50 p-3">
                <h2 className="mt-1 text-xl font-black text-white">Nathaniel Okafor</h2>
              </div>
            </div>

            <div className="grid gap-5">
              <div>
                <p className="panel-title">About NateEyeView</p>
                <h1 className="mt-3 max-w-4xl text-4xl font-black leading-none tracking-wide text-white sm:text-5xl lg:text-6xl">
                  Global health intelligence for clear, research-friendly awareness.
                </h1>
                <p className="mt-5 max-w-4xl text-base leading-7 text-slate-300 sm:text-lg">
                  NateEyeView is a global health intelligence dashboard designed to monitor disease burden, mortality signals,
                  infection trends, and emerging outbreaks worldwide. The platform transforms complex public health data into
                  clear visual insight through maps, analytics, rankings, live updates, and structured disease profiles.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <section key={item.label} className="metric-tile about-stat-card rounded-lg p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                        <item.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_18px_rgba(49,217,139,.75)]" />
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
                    <p className="mt-2 text-sm leading-5 text-slate-400">{item.detail}</p>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-5">
            <section className="glass rounded-lg p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                  <Activity className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="panel-title">Objective</p>
                  <h2 className="mt-2 text-2xl font-black text-white">A centralized view of global disease activity.</h2>
                  <p className="mt-3 leading-7 text-slate-300">
                    The goal of NateEyeView is to improve public awareness, support research, strengthen preparedness, and provide
                    a centralized view of global disease activity. It is built to help users scan high-level patterns quickly,
                    compare country and regional signals, and understand where public health risk is increasing or uncertain.
                  </p>
                </div>
              </div>
            </section>

            <section className="glass rounded-lg p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                  <DatabaseZap className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="panel-title">Data Sources & Coverage</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Designed around trusted public health datasets.</h2>
                  <p className="mt-3 leading-7 text-slate-300">
                    NateEyeView uses or is designed to use public datasets, country-level indicators, and outbreak feeds where
                    available. Coverage varies by source, indicator, reporting jurisdiction, and update schedule.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {sources.map((source) => (
                      <div key={source} className="rounded-md border border-line bg-slate-950/45 p-3 text-sm font-semibold text-slate-200">
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-lg p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                  <BarChart3 className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="panel-title">Data Timeline and Update Frequency</p>
                  <h2 className="mt-2 text-2xl font-black text-white">Current feeds and historical indicators are not the same timeline.</h2>
                  <p className="mt-3 leading-7 text-slate-300">
                    Some health indicators are historical or periodically updated, while outbreak and news data can refresh more
                    frequently. NateEyeView refreshes available data every hour through GitHub Actions, but the actual timeline
                    covered depends on each source. Mortality and disease burden datasets may cover multi-year historical periods,
                    while outbreak and news feeds provide more current situational updates.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="grid gap-5">
            <section className="glass rounded-lg p-5">
              <p className="panel-title">Field note</p>
              <blockquote className="mt-4 text-3xl font-black leading-tight text-white">
                Better data. Better awareness. Better decisions.
              </blockquote>
            </section>

            <section className="glass rounded-lg p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-amber/40 bg-amber/10 text-amber">
                  <ShieldCheck className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="panel-title">Data Transparency</p>
                  <h2 className="text-lg font-black text-white">Label uncertainty clearly.</h2>
                </div>
              </div>
              <p className="mt-4 leading-7 text-slate-300">
                Estimated, stale, unavailable, or fallback data should be clearly labeled to avoid false precision. NateEyeView
                prioritizes transparent data quality flags so users can distinguish reliable signals from provisional indicators.
              </p>
            </section>
          </aside>
        </section>

        <section className="glass rounded-lg p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="rounded-lg border border-line bg-slate-950/45 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                <UserRound className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-4 panel-title">Researcher profile</p>
              <h2 className="mt-2 text-2xl font-black text-white">About the Researcher</h2>
            </div>
            <div>
              <p className="leading-7 text-slate-300">
                Nathaniel Okafor is an emerging technology professional with a strong multidisciplinary background in networking,
                systems administration, data analytics, business leadership, and public-interest technology. He is currently building
                practical experience through academic projects, networking and cybersecurity labs, data-driven research, and applied
                technology development.
              </p>
              <p className="mt-4 leading-7 text-slate-300">
                His background also includes professional experience in banking operations, business management, data science,
                laboratory technology support, and community-focused innovation. NateEyeView reflects his interest in using
                technology, data visualization, and global intelligence tools to make complex information more accessible,
                actionable, and useful for research, awareness, and decision-making.
              </p>
            </div>
          </div>
        </section>

        <footer className="rounded-lg border border-danger/25 bg-danger/10 p-4 text-sm leading-6 text-red-100">
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-amber" aria-hidden />
            <p>NateEyeView is for education, research, and awareness. It is not a substitute for professional medical advice.</p>
          </div>
        </footer>
      </article>
    </Shell>
  );
}
