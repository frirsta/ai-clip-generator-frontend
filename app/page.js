"use client";

import { useCallback, useState } from "react";

import TopBar from "@/components/TopBar";
import UploadZone from "@/components/UploadZone";
import ProcessingPanel from "@/components/ProcessingPanel";
import ClipResultsGrid from "@/components/ClipResultsGrid";
import PreviewModal from "@/components/PreviewModal";
import ErrorBanner from "@/components/ErrorBanner";

import { processVideo, generateClip } from "@/lib/api";

export default function Home() {
  const [file, setFile] = useState(null);

  const [clips, setClips] = useState([]);

  const [videoKey, setVideoKey] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);

  const [activeStepId, setActiveStepId] = useState(null);
  const [completedStepIds, setCompletedStepIds] = useState([]);

  const [isProcessing, setIsProcessing] = useState(false);

  const [error, setError] = useState("");

  const [previewClip, setPreviewClip] = useState(null);

  const handleFileSelected = useCallback((selectedFile) => {
    setFile(selectedFile);
    setError("");
    setClips([]);
    setVideoKey("");
    setVideoDuration(0);
    setActiveStepId(null);
    setCompletedStepIds([]);
    setPreviewClip(null);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setClips([]);
    setVideoKey("");
    setVideoDuration(0);
    setActiveStepId(null);
    setCompletedStepIds([]);
    setError("");
    setPreviewClip(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!file || isProcessing) {
      return;
    }

    setIsProcessing(true);
    setError("");
    setClips([]);
    setPreviewClip(null);
    setCompletedStepIds([]);
    setActiveStepId(null);

    try {
      const result = await processVideo(file, (stepId) => {
        setActiveStepId((previousStepId) => {
          if (previousStepId && previousStepId !== stepId) {
            setCompletedStepIds((previous) => {
              if (previous.includes(previousStepId)) {
                return previous;
              }

              return [...previous, previousStepId];
            });
          }

          return stepId;
        });
      });

      // Mark the final step as complete.
      setCompletedStepIds(["upload", "transcribe", "visual", "suggest"]);

      setActiveStepId(null);

      setClips(result.clips);
      setVideoKey(result.videoKey);
      setVideoDuration(result.videoDuration);
    } catch (err) {
      console.error("PROCESSING ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while processing the video.",
      );
    } finally {
      setIsProcessing(false);
    }
  }, [file, isProcessing]);

  const handleGenerate = useCallback(
    async (clipId) => {
      const clip = clips.find((item) => item.id === clipId);

      if (!clip) {
        return;
      }

      setError("");

      setClips((previous) =>
        previous.map((item) =>
          item.id === clipId
            ? {
                ...item,
                status: "generating",
                errorMessage: null,
              }
            : item,
        ),
      );

      try {
        const result = await generateClip(clip, videoKey);

        setClips((previous) =>
          previous.map((item) =>
            item.id === clipId
              ? {
                  ...item,
                  status: "ready",
                  videoUrl: result.videoUrl,
                  downloadUrl: result.downloadUrl,
                  errorMessage: null,
                }
              : item,
          ),
        );
      } catch (err) {
        console.error("CLIP GENERATION ERROR:", err);

        const message =
          err instanceof Error ? err.message : "Could not generate the clip.";

        setClips((previous) =>
          previous.map((item) =>
            item.id === clipId
              ? {
                  ...item,
                  status: "error",
                  errorMessage: message,
                }
              : item,
          ),
        );
      }
    },
    [clips, videoKey],
  );

  const handleOpenPreview = useCallback((clip) => {
    setPreviewClip(clip);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewClip(null);
  }, []);

  const handleStartOver = useCallback(() => {
    setFile(null);
    setClips([]);
    setVideoKey("");
    setVideoDuration(0);
    setActiveStepId(null);
    setCompletedStepIds([]);
    setError("");
    setPreviewClip(null);
  }, []);

  return (
    <div className="min-h-screen bg-ink-950 text-text-primary">
      <TopBar />

      <main className="mx-auto w-full max-w-5xl px-6 py-12">
        {error && (
          <div className="mb-6">
            <ErrorBanner
              message={error}
              onDismiss={() => setError("")}
              onRetry={file && !isProcessing ? handleAnalyze : undefined}
            />
          </div>
        )}

        {!isProcessing && clips.length === 0 && (
          <section>
            <div className="mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                AI video clipping
              </p>

              <h1 className="mt-3 max-w-2xl font-display text-3xl font-medium tracking-tight text-text-primary sm:text-4xl">
                Turn long-form video into its strongest moments.
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">
                Upload a video and let AI analyze the audio and visuals to find
                the moments worth turning into short-form content.
              </p>
            </div>

            <UploadZone
              file={file}
              onFileSelected={handleFileSelected}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
            />
          </section>
        )}

        {isProcessing && (
          <section className="mx-auto max-w-2xl">
            <div className="mb-8">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                AI analysis
              </p>

              <h1 className="mt-3 font-display text-3xl font-medium tracking-tight text-text-primary">
                Finding your best moments.
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                We are analyzing the video, transcript and visual events
                together.
              </p>
            </div>

            <ProcessingPanel
              activeStepId={activeStepId}
              completedStepIds={completedStepIds}
            />
          </section>
        )}

        {!isProcessing && clips.length > 0 && (
          <ClipResultsGrid
            clips={clips}
            sourceDurationSeconds={videoDuration}
            onGenerate={handleGenerate}
            onOpenPreview={handleOpenPreview}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      <PreviewModal clip={previewClip} onClose={handleClosePreview} />
    </div>
  );
}
