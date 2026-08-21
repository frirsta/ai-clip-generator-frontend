const VISUAL_WORKER_URL =
  "https://ai-clip-visual-worker.ai-clip-generator-mvp.workers.dev";

const CLIP_WORKER_URL =
  "https://ai-clip-clip-worker.ai-clip-generator-mvp.workers.dev";

const PROCESSING_STEPS = [
  { id: "upload", label: "Uploading video" },
  { id: "transcribe", label: "Transcribing audio" },
  { id: "visual", label: "Analyzing visuals" },
  { id: "suggest", label: "Finding the best clips" },
];

export { PROCESSING_STEPS };

async function parseResponse(response, fallbackMessage) {
  let data = {};

  try {
    data = await response.json();
  } catch {
    // Response was not JSON.
  }

  if (!response.ok) {
    throw new Error(data.error || fallbackMessage);
  }

  return data;
}

export async function processVideo(file, onStepStart) {
  // ---------------------------------------------------------
  // 1. Get R2 upload URL
  // ---------------------------------------------------------

  onStepStart?.("upload");

  const uploadUrlResponse = await fetch("/api/upload-url");

  const uploadData = await parseResponse(
    uploadUrlResponse,
    "Could not create upload URL.",
  );

  const { uploadUrl, key } = uploadData;

  if (!uploadUrl || !key) {
    throw new Error("Upload URL or video key is missing.");
  }

  // ---------------------------------------------------------
  // 2. Upload video to R2
  // ---------------------------------------------------------

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "video/mp4",
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Video upload failed.");
  }

  // ---------------------------------------------------------
  // 3. Transcribe video
  // ---------------------------------------------------------

  onStepStart?.("transcribe");

  const formData = new FormData();
  formData.append("audio", file);

  const transcribeResponse = await fetch("/api/transcribe", {
    method: "POST",
    body: formData,
  });

  const transcription = await parseResponse(
    transcribeResponse,
    "Transcription failed.",
  );

  // ---------------------------------------------------------
  // 4. Get actual video duration
  // ---------------------------------------------------------

  const videoDuration = await getVideoDuration(file);

  // ---------------------------------------------------------
  // 5. Analyze visuals
  // ---------------------------------------------------------

  onStepStart?.("visual");

  const visualResponse = await fetch(VISUAL_WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key,
      videoDuration,
    }),
  });

  const visualAnalysis = await parseResponse(
    visualResponse,
    "Visual analysis failed.",
  );

  // ---------------------------------------------------------
  // 6. Analyze transcript + visuals
  // ---------------------------------------------------------

  onStepStart?.("suggest");

  const analyzeResponse = await fetch("/api/analyze-transcript", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      transcript: transcription.text,
      segments: transcription.segments,
      visualAnalysis: visualAnalysis.frames,
      videoDuration,
    }),
  });

  const analysis = await parseResponse(
    analyzeResponse,
    "Clip analysis failed.",
  );

  // ---------------------------------------------------------
  // 7. Normalize backend clips for the UI
  // ---------------------------------------------------------

  const clips = Array.isArray(analysis.clips)
    ? analysis.clips.map((clip, index) => ({
        id: `clip-${index + 1}-${crypto.randomUUID()}`,

        title: clip.title || "Untitled clip",

        startSeconds: Number(clip.start),
        endSeconds: Number(clip.end),

        // Backend score is 1–10.
        // UI expects 0–1.
        score: Number(clip.score) / 10,

        reason: clip.reason || "AI-selected moment.",

        visualEvent: clip.visualEvent || "Important visual moment",

        visualEventTime:
          typeof clip.visualEventTime === "number"
            ? clip.visualEventTime
            : null,

        status: "suggested",

        videoUrl: null,
        downloadUrl: null,

        errorMessage: null,
      }))
    : [];

  if (!clips.length) {
    throw new Error("No suitable clips were found.");
  }

  return {
    clips,
    videoDuration,
    videoKey: key,
  };
}

export async function generateClip(clip, videoKey) {
  if (!videoKey) {
    throw new Error("Video key is missing.");
  }

  if (!clip) {
    throw new Error("Clip is missing.");
  }

  const start = Number(clip.startSeconds);
  const end = Number(clip.endSeconds);

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error("Invalid clip timestamps.");
  }

  const response = await fetch(CLIP_WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: videoKey,
      start,
      end,
    }),
  });

  const result = await parseResponse(response, "Could not generate clip.");

  if (!result.previewUrl || !result.downloadUrl) {
    throw new Error("Clip worker did not return valid clip URLs.");
  }

  return {
    videoUrl: result.previewUrl,
    downloadUrl: result.downloadUrl,
  };
}

function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;

      URL.revokeObjectURL(objectUrl);

      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Could not determine video duration."));
        return;
      }

      resolve(duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not determine video duration."));
    };

    video.src = objectUrl;
  });
}
