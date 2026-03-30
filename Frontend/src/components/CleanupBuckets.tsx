export interface CleanupBucket {
  id: string
  label: string
  description: string
  query: string
  maxResults: number
  visual_style: 'danger-red' | 'warning-orange'
  estimated_count: string
  size_reclaimed: string
}

interface CleanupBucketsProps {
  buckets: CleanupBucket[]
  onSelect: (bucket: CleanupBucket) => void
  selectedId?: string
}

export function CleanupBuckets({ buckets, onSelect, selectedId }: CleanupBucketsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
      {buckets.map((bucket) => {
        const isSelected = selectedId === bucket.id;

        const baseClasses = 'p-6 rounded-2xl border-2 bg-white cursor-pointer transition-all duration-200 relative overflow-hidden';
        const styleClasses = isSelected
          ? bucket.visual_style === 'danger-red'
            ? 'border-red-500 bg-red-50 shadow-md'
            : 'border-orange-500 bg-orange-50 shadow-md'
          : bucket.visual_style === 'danger-red'
            ? 'border-gray-200 hover:border-red-400 hover:shadow-sm'
            : 'border-gray-200 hover:border-orange-400 hover:shadow-sm';
        const badgeClasses = bucket.visual_style === 'danger-red'
          ? 'bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase'
          : 'bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold uppercase';

        return (
          <div
            key={bucket.id}
            onClick={() => onSelect(bucket)}
            className={`${baseClasses} ${styleClasses}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={badgeClasses}>{bucket.label}</span>
              {isSelected && <div className="text-blue-600">✔️</div>}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">{bucket.description}</h3>
            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-4">
              <div className="flex-1">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Estimated</span>
                <p className="text-lg font-bold text-slate-700">{bucket.estimated_count} emails</p>
              </div>
              <div className="flex-1 border-l border-slate-100 pl-4">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Reclaim</span>
                <p className="text-lg font-bold text-emerald-600">~{bucket.size_reclaimed}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
