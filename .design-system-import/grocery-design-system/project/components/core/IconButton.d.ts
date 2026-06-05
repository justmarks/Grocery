import type { ButtonHTMLAttributes } from "react";
import type { IconName } from "./Icon";

/** A borderless, square icon-only button for row + top-bar actions. */
export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required — the glyph to show. */
  icon: IconName;
  /** Icon pixel size. Default 20. */
  size?: number;
  /** `danger` gives a tomato hover wash for destructive actions. */
  variant?: "default" | "danger";
  /** Render the icon filled. Default false. */
  filled?: boolean;
}

export function IconButton(props: IconButtonProps): JSX.Element;
