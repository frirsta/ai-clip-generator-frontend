'use client';

import { useEffect, useRef } from 'react';
import { formatDuration, formatTimecode } from '@/lib/format';

export default function PreviewModal({ clip, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    if (clip) {
      // Move keyboard focus into the modal as soon as it opens.
      closeButtonRef.current?.focus();
    }
  }, [clip]);

  if (!clip) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-lg border border-ink-600 bg-ink-850"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-700 px-5 py-4">
          <div className="min-w-0">
            <h3
              id="preview-modal-title"
              className="truncate font-display text-base font-medium text-text-primary"
            >
              {clip.title}
            </h3>
            <p className="tnum mt-1 font-mono text-xs text-text-tertiary">
              {formatTimecode(clip.startSeconds)} → {formatTimecode(clip.endSeconds)}
              <span className="text-ink-600"> · </span>
              {formatDuration(clip.endSeconds - clip.startSeconds)}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 rounded-sm p-1.5 text-text-tertiary transition-colors hover:text-text-primary"
            aria-label="Close preview"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path
                d="M4 4l8 8m0-8l-8 8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <video src={clip.videoUrl} className="aspect-video w-full bg-black" controls autoPlay />

        <div className="flex justify-end px-5 py-4">
          <a
            href={clip.downloadUrl}
            download
            className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Download clip
          </a>
        </div>
      </div>
    </div>
  );
}
