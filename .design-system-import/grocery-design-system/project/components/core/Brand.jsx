import React from "react";

/**
 * Grocery brand mark — the sibling to the Marks Family Recipe Book
 * lockup. The wordmark reads "Marks Family" (Newsreader semibold) over
 * "Grocery" (Newsreader italic, tomato) — exactly paralleling the Recipe
 * Book's "Recipe Book" line. The monogram is a tomato list card with a
 * checked-off top row, drawn from design tokens so it tracks the palette.
 */
export function Brand({ variant = "lockup", size, className = "" }) {
  if (variant === "mark") {
    return <Monogram size={size ?? 32} className={className} />;
  }

  if (variant === "stacked") {
    const monogramSize = size ?? 72;
    return (
      <div
        className={className}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
      >
        <Monogram size={monogramSize} />
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-2xl)",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "var(--tracking-tight)",
            color: "var(--ink-900)",
            marginTop: "var(--space-4)",
            whiteSpace: "nowrap",
          }}
        >
          Marks Family
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "var(--text-xl)",
            lineHeight: 1.05,
            color: "var(--tomato-500)",
            marginTop: 2,
            whiteSpace: "nowrap",
          }}
        >
          Grocery
        </span>
      </div>
    );
  }

  // Default: horizontal lockup for the top bar / sidebar.
  const monogramSize = size ?? 34;
  return (
    <div
      className={className}
      style={{ display: "flex", alignItems: "center", gap: 10 }}
    >
      <Monogram size={monogramSize} />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, minWidth: 0, whiteSpace: "nowrap" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            color: "var(--ink-900)",
            whiteSpace: "nowrap",
          }}
        >
          Marks Family
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: "var(--text-sm)",
            color: "var(--tomato-500)",
            whiteSpace: "nowrap",
          }}
        >
          Grocery
        </span>
      </div>
    </div>
  );
}

/** The tomato grocery-list monogram. Used in the top bar, sign-in, favicon. */
export function Monogram({ size = 34, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      style={{ flex: "none" }}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="108" height="108" rx="26" fill="var(--tomato-500)" />
      <rect x="28" y="24" width="64" height="72" rx="10" fill="var(--paper-100)" />
      {/* checked top row */}
      <rect x="38" y="36" width="13" height="13" rx="3" fill="var(--olive-500)" />
      <path d="M41 42.5 l2.6 2.6 l4.4 -5" stroke="var(--paper-100)" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="57" y1="42.5" x2="82" y2="42.5" stroke="var(--ink-300)" strokeWidth="3.4" strokeLinecap="round" />
      {/* pending rows */}
      <rect x="38" y="58" width="13" height="13" rx="3" fill="none" stroke="var(--paper-300)" strokeWidth="2" />
      <line x1="57" y1="64.5" x2="84" y2="64.5" stroke="var(--ink-700)" strokeWidth="3.4" strokeLinecap="round" />
      <rect x="38" y="80" width="13" height="13" rx="3" fill="none" stroke="var(--paper-300)" strokeWidth="2" />
      <line x1="57" y1="86.5" x2="79" y2="86.5" stroke="var(--ink-700)" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}
