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
          className="mt-6 w-full rounded-sm bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus-visible:outline-accent"
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
      className={`rounded-lg border border-dashed p-10 text-center transition-colors sm:p-14 ${
        isDragging ? 'border-accent bg-accent/[0.05]' : 'border-ink-600 bg-ink-850/60'
      }`}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ink-600">
        <UploadGlyph className="h-5 w-5 text-text-secondary" />
      </div>

      <h1 className="mt-6 font-display text-2xl font-medium text-text-primary sm:text-[28px]">
        Turn your long video into clips
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-sm text-text-secondary">
        Upload a video and let AI find the moments worth sharing.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-8 rounded-sm bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        Choose video
      </button>
      <p className="mt-4 font-mono text-xs text-text-tertiary">MP4 · MOV · WEBM · MKV</p>

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
