// ---------------------------------------------------------------------------
// Integration layer — matches the ACTUAL backend contract, verified against
// the real route/worker source files. Do not "clean up" field names here;
// they are dictated by the backend, not chosen for aesthetics.
//
// The backend is a separately deployed service (not part of this frontend
// project) at NEXT_PUBLIC_BACKEND_URL. All /api/* calls are absolute
// requests against that base URL — there is no local /api/* route inside
// this frontend.
//
// Pipeline:
//
//   GET  ${BACKEND_URL}/api/upload-url            → { uploadUrl, key }
//   PUT  <uploadUrl>                              → upload the raw file to R2
//   POST ${BACKEND_URL}/api/transcribe (FormData) → { text, segments }
//   POST <VISUAL_WORKER_URL>    { key, videoDuration }
//                                                  → { key, videoDuration, frames }
//   POST ${BACKEND_URL}/api/analyze-transcript
//        { transcript, segments, visualAnalysis, videoDuration }
//                                                  → { clips, videoDuration }
//   POST <CLIP_WORKER_URL>      { key, start, end }
//                                                  → { success, key, previewUrl, downloadUrl }
//
// Notes on identifiers (do not conflate these):
//   - `key`            R2 object key for the ORIGINAL uploaded video
//                       (e.g. "videos/<uuid>.mp4"). Required by the visual
//                       worker and the clip worker. There is no separate
//                       "videoId" anywhere in this backend.
//   - `videoDuration`  Real duration in seconds, read client-side from the
//                       local file (the backend never computes or returns
//                       this). Required by the visual worker AND by
//                       /api/analyze-transcript.
//   - `segments`       Whisper's timestamped transcript segments
//                       ({ start, end, text }[]). Required by
//                       /api/analyze-transcript alongside the plain text.
//   - `frames`         The visual worker's per-timestamp analysis
//                       ({ time, event, type, intensity, description }[]).
//                       Sent to /api/analyze-transcript under the key
//                       "visualAnalysis" (that field name is the backend's,
//                       not ours).
//
// CORS: the deployed backend and both Workers must allow this frontend's
// origin. If you see a CORS error in the browser console naming the backend
// or a *-worker.workers.dev host, that host's allowed-origin configuration
// needs to include the origin this frontend is actually running on — that
// is a backend/Worker-side setting, not something fixable from here.
// ---------------------------------------------------------------------------

import { readVideoDuration } from '@/lib/media';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  // Fails loudly and early rather than silently hitting a relative /api/*
  // path that doesn't exist inside this frontend project.
  console.error(
    'NEXT_PUBLIC_BACKEND_URL is not set. Add it to .env.local and restart the dev server.'
  );
}

const VISUAL_WORKER_URL = 'https://ai-clip-visual-worker.ai-clip-generator-mvp.workers.dev';
const CLIP_WORKER_URL = 'https://ai-clip-clip-worker.ai-clip-generator-mvp.workers.dev';

export const PROCESSING_STEPS = [
  { id: 'upload', label: 'Uploading video' },
  { id: 'transcribe', label: 'Transcribing audio' },
  { id: 'visual', label: 'Analyzing visuals' },
  { id: 'suggest', label: 'Finding the best clips' },
];

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

/**
 * Maps a clip from /api/analyze-transcript's `clips` array to the shape the
 * UI components expect. Backend score is 1–10 (see route.js's RANKING
 * section); ScoreMeter expects 0–1, hence the /10. Every other field is
 * carried through unchanged, including `visualEventTime`, which the backend
 * guarantees falls inside [start, end].
 */
function normalizeClip(raw, index) {
  return {
    id: `clip-${index + 1}`,
    title: raw.title,
    startSeconds: Number(raw.start),
    endSeconds: Number(raw.end),
    visualEventTime: Number(raw.visualEventTime),
    score: Math.max(0, Math.min(1, Number(raw.score) / 10)),
    reason: raw.reason,
    visualEvent: raw.visualEvent,
    status: 'suggested', // 'suggested' | 'generating' | 'ready' | 'error'
    videoUrl: null,
    downloadUrl: null,
    errorMessage: null,
  };
}

/**
 * Runs the full pipeline for a newly selected video: upload, transcribe,
 * analyze visuals, then identify clip-worthy moments.
 *
 * @param {File} file
 * @param {(stepId: string) => void} onStepStart - called as each pipeline
 *   step begins, so the UI can reflect real progress.
 * @returns {Promise<{ key: string, videoDuration: number, transcript: string, clips: Array }>}
 */
export async function processVideo(file, onStepStart) {
  onStepStart?.('upload');

  // The backend needs the real video duration for both the visual worker
  // and /api/analyze-transcript, and never computes it itself — it must be
  // read from the local file before anything else happens.
  const videoDuration = await readVideoDuration(file);
  if (!videoDuration || !Number.isFinite(videoDuration) || videoDuration <= 0) {
    throw new Error("Could not read this video's duration. Please try a different file.");
  }

  // 1. Get a presigned R2 upload URL. Real contract: GET, no body.
  let uploadUrlResponse;
  try {
    uploadUrlResponse = await fetch(`${BACKEND_URL}/api/upload-url`);
  } catch (networkErr) {
    console.error(`Network error calling ${BACKEND_URL}/api/upload-url:`, networkErr);
    throw new Error('Could not start the upload. Please try again.');
  }
  if (!uploadUrlResponse.ok) {
    console.error('/api/upload-url failed:', uploadUrlResponse.status);
    throw new Error('Could not start the upload. Please try again.');
  }
  const { uploadUrl, key } = await safeJson(uploadUrlResponse);
  if (!uploadUrl || !key) {
    console.error('/api/upload-url returned an unexpected payload.');
    throw new Error('Could not start the upload. Please try again.');
  }

  // 2. Upload the raw file directly to R2 via the presigned URL.
  let uploadResponse;
  try {
    uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'video/mp4' },
      body: file,
    });
  } catch (networkErr) {
    console.error('Network error uploading video to R2:', networkErr);
    throw new Error('The video upload did not complete. Please try again.');
  }
  if (!uploadResponse.ok) {
    console.error('R2 upload failed:', uploadResponse.status);
    throw new Error('The video upload did not complete. Please try again.');
  }

  // 3. Transcribe. Real contract: multipart FormData with the whole video
  // file under the "audio" field — not JSON, not an extracted audio track.
  onStepStart?.('transcribe');
  const formData = new FormData();
  formData.append('audio', file);

  let transcribeResponse;
  try {
    transcribeResponse = await fetch(`${BACKEND_URL}/api/transcribe`, {
      method: 'POST',
      body: formData,
    });
  } catch (networkErr) {
    console.error(`Network error calling ${BACKEND_URL}/api/transcribe:`, networkErr);
    throw new Error('Could not transcribe the audio for this video.');
  }
  const transcription = await safeJson(transcribeResponse);
  if (!transcribeResponse.ok) {
    console.error('/api/transcribe failed:', transcription.error || transcribeResponse.status);
    throw new Error(transcription.error || 'Could not transcribe the audio for this video.');
  }

  // 4. Visual analysis worker. Real contract: { key, videoDuration } →
  // { key, videoDuration, frames }.
  onStepStart?.('visual');
  let visualResponse;
  try {
    visualResponse = await fetch(VISUAL_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, videoDuration }),
    });
  } catch (networkErr) {
    console.error('Network error calling the visual worker:', networkErr);
    throw new Error('Could not analyze the video frames.');
  }
  const visualAnalysis = await safeJson(visualResponse);
  if (!visualResponse.ok) {
    console.error('Visual worker failed:', visualAnalysis.error || visualResponse.status);
    throw new Error(visualAnalysis.error || 'Could not analyze the video frames.');
  }

  // 5. Combine transcript + visual analysis into ranked clip suggestions.
  // Real contract: { transcript, segments, visualAnalysis, videoDuration },
  // where `visualAnalysis` here is the visual worker's `frames` array.
  onStepStart?.('suggest');
  let analyzeResponse;
  try {
    analyzeResponse = await fetch(`${BACKEND_URL}/api/analyze-transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcription.text,
        segments: transcription.segments,
        visualAnalysis: visualAnalysis.frames,
        videoDuration,
      }),
    });
  } catch (networkErr) {
    console.error(`Network error calling ${BACKEND_URL}/api/analyze-transcript:`, networkErr);
    throw new Error('Could not identify clip-worthy moments in this video.');
  }
  const analysis = await safeJson(analyzeResponse);
  if (!analyzeResponse.ok) {
    console.error('/api/analyze-transcript failed:', analysis.error || analyzeResponse.status);
    throw new Error(analysis.error || 'Could not identify clip-worthy moments in this video.');
  }

  return {
    key,
    videoDuration,
    transcript: transcription.text,
    clips: (analysis.clips ?? []).map(normalizeClip),
  };
}

/**
 * Renders the final short-form clip via the Clip Worker.
 * Real contract: POST { key, start, end } → { success, key, previewUrl, downloadUrl }.
 *
 * @param {string} key - R2 key of the ORIGINAL source video (not the clip).
 * @param {{ startSeconds: number, endSeconds: number }} clip
 * @returns {Promise<{ videoUrl: string, downloadUrl: string }>}
 */
export async function generateClip(key, clip) {
  let response;
  try {
    response = await fetch(CLIP_WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key,
        start: clip.startSeconds,
        end: clip.endSeconds,
      }),
    });
  } catch (networkErr) {
    console.error('Network error calling the clip worker:', networkErr);
    throw new Error('This clip could not be generated. Please try again.');
  }

  const data = await safeJson(response);
  if (!response.ok || !data.success) {
    console.error('Clip worker failed:', data.error || response.status);
    throw new Error(data.error || 'This clip could not be generated. Please try again.');
  }
  if (!data.previewUrl || !data.downloadUrl) {
    console.error('Clip worker response missing preview/download URL:', data);
    throw new Error('This clip could not be generated. Please try again.');
  }

  return { videoUrl: data.previewUrl, downloadUrl: data.downloadUrl };
}
