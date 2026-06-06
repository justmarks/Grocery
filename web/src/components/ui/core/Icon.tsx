import type { ReactNode, SVGProps } from "react";

/**
 * Lucide-style stroke icons, inlined as React fragments to keep the
 * primitives bundle self-contained (no Lucide runtime). 1.5px stroke,
 * 24×24 viewBox, `currentColor`. Sizes default to 20px.
 *
 * Shared with the Marks Family Recipe Book, extended with the grocery
 * glyphs this app needs (cart, store, snowflake, minus, filter). Keep
 * the set outline-only — never filled — to match the editorial vibe.
 * If a new glyph is needed, add a path here. Never add a third-party
 * icon library.
 */

export type IconName =
  | "plus"
  | "minus"
  | "search"
  | "check"
  | "x"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "chevron-up"
  | "arrow-left"
  | "pencil"
  | "trash"
  | "shopping-cart"
  | "store"
  | "snowflake"
  | "filter"
  | "list-checks"
  | "users"
  | "user"
  | "settings"
  | "sparkles"
  | "share-2"
  | "mail"
  | "log-out"
  | "clock"
  | "grip-vertical";

const ICON_PATHS: Record<IconName, ReactNode> = {
  plus: (
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  ),
  minus: <line x1="5" y1="12" x2="19" y2="12" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" />
    </>
  ),
  check: <polyline points="4 12 10 18 20 6" />,
  x: (
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  ),
  "chevron-right": <polyline points="9 6 15 12 9 18" />,
  "chevron-left": <polyline points="15 6 9 12 15 18" />,
  "chevron-down": <polyline points="6 9 12 15 18 9" />,
  "chevron-up": <polyline points="6 15 12 9 18 15" />,
  "arrow-left": (
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </>
  ),
  pencil: (
    <>
      <path d="M16 3 L21 8 L8 21 L3 21 L3 16 Z" />
      <line x1="14" y1="5" x2="19" y2="10" />
    </>
  ),
  trash: (
    <>
      <polyline points="3 6 21 6" />
      <path d="M5 6 v14 a2 2 0 0 0 2 2 h10 a2 2 0 0 0 2-2 v-14" />
      <path d="M9 6 V4 a1 1 0 0 1 1-1 h4 a1 1 0 0 1 1 1 v2" />
    </>
  ),
  "shopping-cart": (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3 h2.5 l2.4 12.2 a1.5 1.5 0 0 0 1.5 1.2 h8.6 a1.5 1.5 0 0 0 1.5-1.2 l1.5-7.4 H6" />
    </>
  ),
  store: (
    <>
      <path d="M4 9 L5 4 h14 l1 5 a3 3 0 0 1-6 0 a3 3 0 0 1-6 0 a3 3 0 0 1-6 0 z" />
      <path d="M5 9 v11 h14 V9" />
      <path d="M10 20 v-5 h4 v5" />
    </>
  ),
  snowflake: (
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
      <line x1="18.4" y1="5.6" x2="5.6" y2="18.4" />
      <polyline points="9 5 12 8 15 5" />
      <polyline points="9 19 12 16 15 19" />
      <polyline points="5 9 8 12 5 15" />
      <polyline points="19 9 16 12 19 15" />
    </>
  ),
  filter: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </>
  ),
  "list-checks": (
    <>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <line x1="13" y1="6" x2="21" y2="6" />
      <line x1="13" y1="12" x2="21" y2="12" />
      <line x1="13" y1="18" x2="21" y2="18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21 v-1 a5 5 0 0 1 5-5 h4 a5 5 0 0 1 5 5 v1" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16 14 h2 a4 4 0 0 1 4 4 v1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 v-1 a6 6 0 0 1 6-6 h4 a6 6 0 0 1 6 6 v1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3 L13.5 9 L19.5 10.5 L13.5 12 L12 18 L10.5 12 L4.5 10.5 L10.5 9 Z" />
      <path d="M19 3 L19.5 5 L21.5 5.5 L19.5 6 L19 8 L18.5 6 L16.5 5.5 L18.5 5 Z" />
    </>
  ),
  "share-2": (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </>
  ),
  "log-out": (
    <>
      <path d="M14 4 h4 a2 2 0 0 1 2 2 v12 a2 2 0 0 1-2 2 h-4" />
      <polyline points="9 16 4 12 9 8" />
      <line x1="4" y1="12" x2="16" y2="12" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 16 14" />
    </>
  ),
  "grip-vertical": (
    <>
      <circle cx="9" cy="7" r="1.25" stroke="none" fill="currentColor" />
      <circle cx="15" cy="7" r="1.25" stroke="none" fill="currentColor" />
      <circle cx="9" cy="12" r="1.25" stroke="none" fill="currentColor" />
      <circle cx="15" cy="12" r="1.25" stroke="none" fill="currentColor" />
      <circle cx="9" cy="17" r="1.25" stroke="none" fill="currentColor" />
      <circle cx="15" cy="17" r="1.25" stroke="none" fill="currentColor" />
    </>
  ),
};

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  /** Which glyph to render. */
  name: IconName;
  /** Pixel size (width = height). Default 20. */
  size?: number;
  /** Fill with currentColor instead of outline-only. Default false. */
  filled?: boolean;
}

export function Icon({
  name,
  size = 20,
  className,
  filled = false,
  ...rest
}: IconProps) {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {path}
    </svg>
  );
}

/** All registered icon names, useful for specimen rendering. */
export const ICON_NAMES = Object.keys(ICON_PATHS) as IconName[];
