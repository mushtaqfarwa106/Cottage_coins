/** Faint corner arc for metric cards; uses currentColor for dark mode. */
export function DashboardCardDecoration({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="100" cy="0" r="72" stroke="currentColor" strokeWidth="1" strokeOpacity="0.14" />
      <circle cx="100" cy="0" r="48" stroke="currentColor" strokeWidth="1" strokeOpacity="0.1" />
    </svg>
  );
}
