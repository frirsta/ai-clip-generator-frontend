import ClipCard from './ClipCard';

export default function ClipResultsGrid({ clips, sourceDurationSeconds, onGenerate, onOpenPreview, onStartOver }) {
  const readyCount = clips.filter((c) => c.status === 'ready').length;

  return (
    <div className="animate-fadeUp">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium text-text-primary">
            {clips.length} suggested clips
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Ranked by AI score. Generate the ones worth keeping.
            {readyCount > 0 && (
              <span className="text-text-tertiary"> {readyCount} generated so far.</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="shrink-0 rounded-sm border border-ink-600 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-ink-500 hover:text-text-primary"
        >
          Start over with a new video
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            sourceDurationSeconds={sourceDurationSeconds}
            onGenerate={onGenerate}
            onOpenPreview={onOpenPreview}
          />
        ))}
      </div>
    </div>
  );
}
