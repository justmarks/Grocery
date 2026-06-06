import type { ReactNode } from "react";
import type { IconName } from "../core/Icon";

/** Centered empty state — icon disc, serif headline, body, action slot. */
export interface EmptyStateProps {
  /** Icon in the paper disc. Default "shopping-cart". */
  icon?: IconName;
  /** Serif headline. */
  title: string;
  /** Body copy below the headline. */
  children?: ReactNode;
  /** Optional action node (usually a Button). */
  action?: ReactNode;
}

export function EmptyState(props: EmptyStateProps): JSX.Element;
