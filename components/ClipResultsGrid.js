import ClipCard from './ClipCard';

export default function ClipResultsGrid({ clips, sourceDurationSeconds, onGenerate, onOpenPreview, onStartOver }) {
  const readyCount = clips.filter((c) => c.status === 'ready').length;

  return (
    <div className="animate-fadeUp">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-text-primary">
            Your clips
          </h2>
          <p className="mt-1.5 text-sm text-text-secondary">
            {clips.length} moment{clips.length === 1 ? '' : 's'} found · generate the ones worth keeping.
            {readyCount > 0 && (
              <span className="text-text-tertiary"> {readyCount} generated so far.</span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartOver}
          className="self-start rounded-sm border border-ink-600 bg-ink-800 px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:border-ink-500 hover:text-text-primary sm:shrink-0"
        >
          Start over with a new video
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {clips.map((clip, index) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            sourceDurationSeconds={sourceDurationSeconds}
            onGenerate={onGenerate}
            onOpenPreview={onOpenPreview}
            isTopPick={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
