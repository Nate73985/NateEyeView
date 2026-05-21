import { qualityLabels } from '@/lib/constants';
import type { DataQualityFlag } from '@/lib/types';

export default function QualityBadge({ value }: { value: DataQualityFlag }) {
  const tone =
    value === 'reported'
      ? 'border-success/40 bg-success/10 text-success'
      : value === 'mocked' || value === 'unavailable'
        ? 'border-danger/40 bg-danger/10 text-red-200'
        : 'border-amber/40 bg-amber/10 text-amber';

  return <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${tone}`}>{qualityLabels[value]}</span>;
}
