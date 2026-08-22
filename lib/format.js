/**
 * Formats a seconds value as an editing-precision timecode: MM:SS.ss, with
 * an HH: prefix once the source passes an hour. Always zero-padded and
 * tabular so a column of timecodes lines up, matching how NLEs display time.
 */
export function formatTimecode(totalSeconds) {
  const s = Math.max(0, totalSeconds || 0);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = seconds.toFixed(2).padStart(5, '0');

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/** Formats a duration in seconds as e.g. "08.00s" or "1m 12.50s". */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, totalSeconds || 0);
  if (s < 60) return `${s.toFixed(2)}s`;

  const minutes = Math.floor(s / 60);
  const seconds = s - minutes * 60;
  return `${minutes}m ${seconds.toFixed(2)}s`;
}

export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
