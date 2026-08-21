'use client';

import { useEffect } from 'react';

export default function PreviewModal({ clip, onClose }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!clip) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview: ${clip.title}`}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-lg border border-ink-600 bg-ink-850"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink-700 px-5 py-3.5">
          <h3 className="font-display text-sm font-medium text-text-primary">{clip.title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-text-tertiary transition-colors hover:text-text-primary"
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

        <div className="flex justify-end gap-2 px-5 py-4">
          <a
            href={clip.downloadUrl}
            download
            className="rounded-sm bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90"
          >
            Download clip
          </a>
        </div>
      </div>
    </div>
  );
}
