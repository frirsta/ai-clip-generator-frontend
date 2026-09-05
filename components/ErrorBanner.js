export default function ErrorBanner({ message, onRetry, onDismiss }) {
  return (
    <div
      role="alert"
      className="animate-fadeUp flex flex-col gap-4 rounded-lg border border-danger/30 bg-danger-soft px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <p className="text-sm font-medium text-text-primary">Processing failed</p>
        <p className="mt-1 text-sm text-text-secondary">{message}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-sm bg-danger px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-danger/90"
          >
            Try again
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-sm px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:text-text-secondary"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
