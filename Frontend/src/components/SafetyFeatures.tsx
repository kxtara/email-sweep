import { IoShieldCheckmark } from "react-icons/io5";

interface SafetyFeaturesProps {
  excludeStarred: boolean
  onToggleExcludeStarred: (enabled: boolean) => void
}

export function SafetyFeatures({ excludeStarred, onToggleExcludeStarred }: SafetyFeaturesProps) {
  return (
    <div className="mb-10 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <IoShieldCheckmark  size={24} />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-slate-900">Safety Protocol</h2>
          <p className="text-sm text-slate-500">Starred emails are never deleted by default</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={excludeStarred}
            onChange={(e) => onToggleExcludeStarred(e.target.checked)}
          />
          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
}
