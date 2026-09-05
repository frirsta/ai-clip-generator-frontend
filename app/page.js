'use client';

import { useCallback, useState } from 'react';
import TopBar from '@/components/TopBar';
import UploadZone from '@/components/UploadZone';
import ProcessingPanel from '@/components/ProcessingPanel';
import ClipResultsGrid from '@/components/ClipResultsGrid';
import PreviewModal from '@/components/PreviewModal';
import ErrorBanner from '@/components/ErrorBanner';
import { processVideo, generateClip, PROCESSING_STEPS } from '@/lib/api';

const STEP_ORDER = PROCESSING_STEPS.map((step) => step.id);

const HOW_IT_WORKS = [
  { number: '01', title: 'Analyze', description: 'AI understands your video' },
  { number: '02', title: 'Discover', description: 'Find moments worth sharing' },
  { number: '03', title: 'Clip', description: 'Create ready-to-share clips' },
];

// 'upload' → 'processing' → 'results'
export default function Page() {
  const [phase, setPhase] = useState('upload');

  const [file, setFile] = useState(null);

  const [activeStepId, setActiveStepId] = useState(null);
  const [completedStepIds, setCompletedStepIds] = useState([]);

  // R2 object key for the ORIGINAL uploaded video — required by the clip
  // worker later. Not a "video ID"; the backend has no such concept.
  const [videoKey, setVideoKey] = useState(null);
  const [sourceDurationSeconds, setSourceDurationSeconds] = useState(null);

  const [clips, setClips] = useState([]);
  const [previewClip, setPreviewClip] = useState(null);

  const [pipelineError, setPipelineError] = useState(null);

  const handleFileSelected = useCallback((selectedFile) => {
    setFile(selectedFile);
    setPipelineError(null);
  }, []);

  const handleClearFile = useCallback(() => {
    setFile(null);
    setPipelineError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file) return;

    setPipelineError(null);
    setCompletedStepIds([]);
    setActiveStepId(STEP_ORDER[0]);
    setPhase('processing');

    try {
      const result = await processVideo(file, (stepId) => {
        const stepIndex = STEP_ORDER.indexOf(stepId);
        setCompletedStepIds(STEP_ORDER.slice(0, Math.max(stepIndex, 0)));
        setActiveStepId(stepId);
      });

      const rankedClips = [...result.clips].sort((a, b) => b.score - a.score);

      setVideoKey(result.key);
      setSourceDurationSeconds(result.videoDuration);
      setClips(rankedClips);
      setPhase('results');
    } catch (err) {
      console.error('Video processing pipeline failed:', err);
      setPipelineError(err.message || 'Something went wrong while analyzing this video.');
      setPhase('upload');
    }
  }, [file]);

  const handleGenerate = useCallback(
    async (clipId) => {
      const clip = clips.find((c) => c.id === clipId);
      if (!clip || !videoKey) return;

      setClips((current) =>
        current.map((c) =>
          c.id === clipId ? { ...c, status: 'generating', errorMessage: null } : c
        )
      );

      try {
        const { videoUrl, downloadUrl } = await generateClip(videoKey, clip);
        setClips((current) =>
          current.map((c) =>
            c.id === clipId ? { ...c, status: 'ready', videoUrl, downloadUrl } : c
          )
        );
      } catch (err) {
        console.error(`Clip generation failed for ${clipId}:`, err);
        setClips((current) =>
          current.map((c) =>
            c.id === clipId
              ? { ...c, status: 'error', errorMessage: err.message || 'This clip could not be generated.' }
              : c
          )
        );
      }
    },
    [clips, videoKey]
  );

  const handleStartOver = useCallback(() => {
    setPhase('upload');
    setFile(null);
    setVideoKey(null);
    setSourceDurationSeconds(null);
    setClips([]);
    setPipelineError(null);
    setCompletedStepIds([]);
    setActiveStepId(null);
  }, []);

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-5xl px-6 py-10 sm:py-16">
        {phase === 'upload' && (
          <div className="mx-auto flex max-w-2xl flex-col gap-5">
            {pipelineError && (
              <ErrorBanner
                message={pipelineError}
                onRetry={file ? handleAnalyze : undefined}
                onDismiss={() => setPipelineError(null)}
              />
            )}
            <UploadZone
              file={file}
              onFileSelected={handleFileSelected}
              onAnalyze={handleAnalyze}
              onClear={handleClearFile}
            />

            {!file && (
              <div className="mt-6 grid grid-cols-1 divide-y divide-ink-700 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                {HOW_IT_WORKS.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-4 py-5 sm:flex-col sm:gap-2 sm:px-6 sm:py-0 sm:first:pl-0 sm:last:pr-0"
                  >
                    <span className="tnum font-mono text-xs text-text-tertiary">
                      {step.number}
                    </span>
                    <div>
                      <p className="font-display text-xs font-semibold uppercase tracking-wider text-text-secondary">
                        {step.title}
                      </p>
                      <p className="mt-1 text-sm text-text-tertiary">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === 'processing' && (
          <div className="mx-auto max-w-xl">
            <ProcessingPanel activeStepId={activeStepId} completedStepIds={completedStepIds} />
          </div>
        )}

        {phase === 'results' && (
          <ClipResultsGrid
            clips={clips}
            sourceDurationSeconds={sourceDurationSeconds || 1}
            onGenerate={handleGenerate}
            onOpenPreview={setPreviewClip}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      <PreviewModal clip={previewClip} onClose={() => setPreviewClip(null)} />
    </div>
  );
}
