export default function TopBar() {
  return (
    <header className="border-b border-ink-700">
      <div className="mx-auto flex max-w-5xl items-baseline gap-3 px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          <span className="font-display text-[15px] font-semibold tracking-tight text-text-primary">
            MightyClipper
          </span>
        </div>
        <span className="hidden text-xs text-text-tertiary sm:inline">
          AI-powered clipping for creators.
        </span>
      </div>
    </header>
  );
}
