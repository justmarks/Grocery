import type { SVGProps } from "react";

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

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  /** Which glyph to render. */
  name: IconName;
  /** Pixel size (width = height). Default 20. */
  size?: number;
  /** Fill with currentColor instead of outline-only. Default false. */
  filled?: boolean;
}

/**
 * Outline-only stroke icon, 24x24 viewBox, 1.5px stroke, currentColor.
 * The single icon source for the whole system — never reach for a
 * third-party icon library; add a path to Icon.jsx instead.
 */
export function Icon(props: IconProps): JSX.Element | null;

/** All registered icon names, for specimen rendering. */
export const ICON_NAMES: IconName[];
