import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";

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

/**
 * Square, borderless icon-only button — row actions (edit, delete),
 * top-bar controls. 44px min tap target with a paper hover wash.
 */
export function IconButton({
  icon,
  size = 20,
  variant = "default",
  className = "",
  type = "button",
  filled = false,
  ...rest
}: IconButtonProps) {
  const classes = [
    "gr-iconbtn",
    variant === "danger" ? "gr-iconbtn--danger" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      <Icon name={icon} size={size} filled={filled} />
    </button>
  );
}
