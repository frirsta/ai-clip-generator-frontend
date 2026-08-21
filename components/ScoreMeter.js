const SEGMENT_COUNT = 10;

/**
 * Renders the AI confidence score as a segmented level meter rather than a
 * percentage badge or star rating — the same visual language as an audio
 * meter, which is the vocabulary this product's users already know.
 */
export default function ScoreMeter({ score, size = 'default' }) {
  const filledCount = Math.round(score * SEGMENT_COUNT);
  const isTall = size === 'default';

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex items-end gap-[3px]" aria-hidden="true">
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => {
          const filled = i < filledCount;
          return (
            <span
              key={i}
              className={`w-[3px] rounded-full transition-colors duration-300 ${
                filled ? 'bg-accent' : 'bg-ink-600'
              }`}
              style={{
                height: isTall ? `${8 + i * 1.6}px` : `${5 + i * 1}px`,
              }}
            />
          );
        })}
      </div>
      <span className="tnum font-mono text-sm text-text-secondary">
        {Math.round(score * 100)}
        <span className="text-text-tertiary">/100</span>
      </span>
      <span className="sr-only">AI confidence score: {Math.round(score * 100)} out of 100</span>
    </div>
  );
}
