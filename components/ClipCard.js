'use client';

import ScoreMeter from './ScoreMeter';
import { formatDuration, formatTimecode } from '@/lib/format';

export default function ClipCard({ clip, sourceDurationSeconds, onGenerate, onOpenPreview }) {
  const duration = clip.endSeconds - clip.startSeconds;

  return (
    <article className="animate-fadeUp flex flex-col overflow-hidden rounded-lg border border-ink-600 bg-ink-850">
      <ClipMedia
        clip={clip}
        sourceDurationSeconds={sourceDurationSeconds}
        onOpenPreview={onOpenPreview}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[15px] font-medium leading-snug text-text-primary">
            {clip.title}
          </h3>
          <span className="shrink-0 rounded-sm border border-ink-600 px-2 py-0.5 font-mono text-[11px] text-text-secondary">
            {clip.visualEvent}
          </span>
        </div>

        <div className="tnum mt-2.5 flex items-center gap-2 font-mono text-xs text-text-tertiary">
          <span>{formatTimecode(clip.startSeconds)}</span>
          <span className="text-ink-600">→</span>
          <span>{formatTimecode(clip.endSeconds)}</span>
          <span className="text-ink-600">·</span>
          <span>{formatDuration(duration)}</span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{clip.reason}</p>

        <div className="mt-4">
          <ScoreMeter score={clip.score} />
        </div>

        <div className="mt-5">
          <ClipAction clip={clip} onGenerate={onGenerate} onOpenPreview={onOpenPreview} />
        </div>
      </div>
    </article>
  );
}

function ClipMedia({ clip, sourceDurationSeconds, onOpenPreview }) {
  if (clip.status === 'ready') {
    return (
      <button
        type="button"
        onClick={() => onOpenPreview(clip)}
        className="group relative aspect-video w-full bg-black"
      >
        <video
          src={clip.videoUrl}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
            <svg viewBox="0 0 16 16" className="ml-0.5 h-4 w-4" fill="#0B0C0E">
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="relative aspect-video w-full bg-ink-900">
      {clip.status === 'generating' && (
        <div className="shimmer-surface absolute inset-0 animate-shimmer" />
      )}

      {/* Position-in-source indicator: where this clip sits in the full
          upload, and how much of it is being used — reads honestly instead
          of a fabricated thumbnail frame. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
        {clip.status === 'error' ? (
          <ErrorGlyph className="h-6 w-6 text-danger" />
        ) : (
          <PositionBar
            startSeconds={clip.startSeconds}
            endSeconds={clip.endSeconds}
            sourceDurationSeconds={sourceDurationSeconds}
            muted={clip.status === 'generating'}
          />
        )}
      </div>
    </div>
  );
}

function PositionBar({ startSeconds, endSeconds, sourceDurationSeconds, muted }) {
  const total = Math.max(sourceDurationSeconds, endSeconds);
  const left = (startSeconds / total) * 100;
  const width = Math.max(((endSeconds - startSeconds) / total) * 100, 1.5);

  return (
    <div className="w-full max-w-[220px]">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <span
          className={`absolute inset-y-0 rounded-full ${muted ? 'bg-text-tertiary' : 'bg-accent'}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      </div>
      <p className="mt-3 text-center font-mono text-[11px] text-text-tertiary">
        position in source video
      </p>
    </div>
  );
}

function ClipAction({ clip, onGenerate, onOpenPreview }) {
  if (clip.status === 'ready') {
    return (
      <div className="flex gap-2">
        <a
          href={clip.downloadUrl}
          download
          className="flex-1 rounded-sm bg-accent px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent/90"
        >
          Download clip
        </a>
        <button
          type="button"
          onClick={() => onOpenPreview(clip)}
          className="rounded-sm border border-ink-600 px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-ink-500 hover:bg-ink-800"
        >
          Open preview
        </button>
      </div>
    );
  }

  if (clip.status === 'generating') {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2 rounded-sm border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm font-medium text-text-secondary"
      >
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-text-tertiary border-t-transparent" />
        Generating clip…
      </button>
    );
  }

  if (clip.status === 'error') {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs text-danger">{clip.errorMessage || 'Something went wrong.'}</p>
        <button
          type="button"
          onClick={() => onGenerate(clip.id)}
          className="w-full rounded-sm border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger/15"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onGenerate(clip.id)}
      className="w-full rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
    >
      Generate clip
    </button>
  );
}

function ErrorGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" />
    </svg>
  );
}
