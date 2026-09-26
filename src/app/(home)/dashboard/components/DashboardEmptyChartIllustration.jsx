/** Inline SVG for monthly trend empty state; theme-safe via currentColor. */
export function DashboardEmptyChartIllustration({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M20 118h160"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
      <path
        d="M20 118V24"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
      <rect x="36" y="72" width="22" height="46" rx="3" fill="currentColor" fillOpacity="0.12" />
      <rect x="72" y="52" width="22" height="66" rx="3" fill="currentColor" fillOpacity="0.1" />
      <rect x="108" y="88" width="22" height="30" rx="3" fill="currentColor" fillOpacity="0.12" />
      <rect x="144" y="40" width="22" height="78" rx="3" fill="currentColor" fillOpacity="0.08" />
      <circle cx="100" cy="28" r="10" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.2" />
      <path
        d="M96 28h8M100 24v8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />
    </svg>
  );
}
