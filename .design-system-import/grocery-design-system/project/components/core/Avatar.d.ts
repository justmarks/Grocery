import type { HTMLAttributes } from "react";

/** Round household-member avatar — photo or deterministic initials disc. */
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Member name — drives the initials and the deterministic color. */
  name: string;
  /** Optional photo URL; falls back to initials when absent. */
  src?: string;
  /** Diameter in px. Default 32. */
  size?: number;
}

export function Avatar(props: AvatarProps): JSX.Element;
