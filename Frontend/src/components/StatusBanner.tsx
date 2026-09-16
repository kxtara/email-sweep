type StatusBannerProps = {
  type: "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
};

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function StatusBanner({ type, message, onDismiss }: StatusBannerProps) {
  return (
    <div
      className={`mb-6 rounded-lg border px-4 py-3 text-sm flex items-start justify-between gap-4 ${styles[type]}`}
      role="status"
    >
      <span>{message}</span>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="font-semibold shrink-0 hover:opacity-70"
          aria-label="Dismiss message"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
