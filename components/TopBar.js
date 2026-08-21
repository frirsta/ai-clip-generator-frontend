export default function TopBar() {
  return (
    <header className="border-b border-ink-700">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            AI Clip Generator
          </span>
        </div>
        <span className="font-mono text-xs text-text-tertiary">v0.1</span>
      </div>
    </header>
  );
}
