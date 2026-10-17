interface MockDataBannerProps {
  className?: string;
}

export function MockDataBanner({ className = "" }: MockDataBannerProps) {
  return (
    <div
      role="note"
      aria-label="Mock data notice"
      className={`rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`}
    >
      <strong className="font-semibold">Mock data only.</strong> Results are generated sample fares for
      planning the app — they are <em>not</em> live prices, availability or bookable offers.
    </div>
  );
}
