'use client';

import { useCallback, useRef, useState } from 'react';
import { formatBytes } from '@/lib/format';

const ACCEPTED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];

export default function UploadZone({ file, onFileSelected, onAnalyze, onClear }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const picked = fileList?.[0];
      if (!picked) return;
      onFileSelected(picked);
    },
    [onFileSelected]
  );

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  if (file) {
    return (
      <div className="animate-fadeUp rounded-lg border border-ink-600 bg-ink-850 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-ink-800">
              <PlayGlyph className="h-5 w-5 text-text-secondary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-text-primary">{file.name}</p>
              <p className="mt-1 font-mono text-xs text-text-tertiary">
                {formatBytes(file.size)} · ready to analyze
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-sm px-2 py-1 text-xs text-text-tertiary transition-colors hover:text-text-secondary"
          >
            Change
          </button>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          className="mt-6 w-full rounded-sm bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent/90 focus-visible:outline-accent"
        >
          Analyze video
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-lg border border-dashed p-14 text-center transition-colors ${
        isDragging ? 'border-accent bg-accent/[0.04]' : 'border-ink-600 bg-ink-850/60'
      }`}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-ink-600">
        <UploadGlyph className="h-4 w-4 text-text-secondary" />
      </div>

      <h2 className="mt-5 font-display text-lg font-medium text-text-primary">
        Drop a video to find its best clips
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
        Upload a long-form video. The AI finds the strongest short-form moments
        for you to review.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-6 rounded-sm border border-ink-600 bg-ink-800 px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-ink-500 hover:bg-ink-700"
      >
        Choose a file
      </button>
      <p className="mt-3 font-mono text-xs text-text-tertiary">MP4, MOV, WEBM, MKV</p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

function UploadGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
    </svg>
  );
}
