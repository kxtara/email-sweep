interface ConfirmationModalProps {
  isOpen: boolean
  count: string
  timeframe: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  count,
  timeframe,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        <div className="flex items-center gap-3 text-red-600 mb-4">
            alert triangle icon
          {/* <AlertTriangle size={28} /> */}
          <h2 className="text-2xl font-bold">Confirm Deletion</h2>
        </div>
        <p className="text-slate-600 mb-6 leading-relaxed">
          You are about to permanently delete <span className="font-bold text-slate-900">{count} emails</span> from <span className="font-bold text-slate-900">{timeframe}</span>.
        </p>
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg mb-8 text-sm text-amber-800">
          This action is irreversible. Deleted items will be removed from your Google account.
        </div>
        <div className="flex gap-4">
          <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
          <button onClick={onConfirm} className="btn-danger flex-1" disabled={isLoading}>
            {isLoading ? 'Cleaning...' : 'Confirm Sweep'}
          </button>
        </div>
      </div>
    </div>
  );
}
