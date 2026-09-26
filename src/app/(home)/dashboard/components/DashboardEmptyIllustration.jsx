/**
 * Small empty-state art for list / donut sections.
 * @param {{ variant: "list" | "pie", className?: string }} props
 */
export function DashboardEmptyIllustration({ variant = "list", className }) {
  if (variant === "pie") {
    return (
      <svg
        className={className}
        viewBox="0 0 160 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle
          cx="80"
          cy="62"
          r="38"
          stroke="currentColor"
          strokeWidth="10"
          strokeOpacity="0.12"
          strokeDasharray="60 120"
          strokeLinecap="round"
          transform="rotate(-90 80 62)"
        />
        <circle cx="80" cy="62" r="22" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.15" />
        <path
          d="M80 40v44M62 62h36"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.18"
        />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="28"
        y="22"
        width="104"
        height="84"
        rx="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.2"
      />
      <path
        d="M44 42h72M44 58h52M44 74h64M44 90h40"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.15"
      />
      <circle cx="120" cy="36" r="6" fill="currentColor" fillOpacity="0.1" />
    </svg>
  );
}
