import type { LucideIcon } from 'lucide-react';

export default function KpiCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <section className="glass rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="panel-title">{label}</p>
          <p className="mt-2 text-2xl font-black text-white 3xl:text-3xl">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{detail}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </section>
  );
}
