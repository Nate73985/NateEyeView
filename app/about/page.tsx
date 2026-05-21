import Shell from '@/components/Shell';

export default function AboutPage() {
  return (
    <Shell>
      <article className="mx-auto max-w-4xl">
        <section className="glass rounded-lg p-6">
          <p className="panel-title">About</p>
          <h1 className="mt-2 text-4xl font-black text-white">NateEyeView</h1>
          <p className="mt-4 leading-7 text-slate-300">
            NateEyeView is a high-definition global intelligence dashboard for monitoring disease burden, mortality signals, and outbreak news.
            It is designed for large displays, operations rooms, laptops, tablets, and phones, with static JSON data artifacts that can be refreshed by GitHub Actions.
          </p>
          <p className="mt-4 leading-7 text-slate-300">
            The project favors transparent data quality labels over false precision. Fields that are estimated, stale, unavailable, or mocked are marked in the dataset and surfaced in the interface.
          </p>
        </section>
      </article>
    </Shell>
  );
}
