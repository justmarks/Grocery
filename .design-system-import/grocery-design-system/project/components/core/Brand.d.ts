/** The Grocery brand mark — wordmark lockup + tomato list monogram. */
export interface BrandProps {
  /**
   * - "lockup" (default): monogram + two-line wordmark, for the top bar.
   * - "stacked": monogram over wordmark, for sign-in / launch cards.
   * - "mark": just the monogram.
   */
  variant?: "lockup" | "stacked" | "mark";
  /** Monogram px size. Defaults 34 (lockup) / 72 (stacked) / 32 (mark). */
  size?: number;
  className?: string;
}

export function Brand(props: BrandProps): JSX.Element;

export interface MonogramProps {
  size?: number;
  className?: string;
}

/** The tomato grocery-list monogram alone. */
export function Monogram(props: MonogramProps): JSX.Element;
