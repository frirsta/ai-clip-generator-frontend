// ---------------------------------------------------------------------------
// Browser-only media utilities. No backend calls here — this reads metadata
// directly from the local File the user selected, purely to support the UI
// (e.g. showing a clip's position within the source video).
// ---------------------------------------------------------------------------

/**
 * Resolves to the duration (in seconds) of a local video file, or null if
 * it can't be read (unsupported format, corrupt file, etc). Never throws.
 * @param {File} file
 * @returns {Promise<number|null>}
 */
export function readVideoDuration(file) {
  return new Promise((resolve) => {
    let objectUrl;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch (err) {
      resolve(null);
      return;
    }

    const videoEl = document.createElement('video');
    videoEl.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    videoEl.onloadedmetadata = () => {
      const duration = Number.isFinite(videoEl.duration) ? videoEl.duration : null;
      cleanup();
      resolve(duration);
    };
    videoEl.onerror = () => {
      cleanup();
      resolve(null);
    };

    videoEl.src = objectUrl;
  });
}
