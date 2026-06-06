import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

const ICON_SIZE: Record<"sm" | "md" | "lg", number> = { sm: 14, md: 16, lg: 18 };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `success` is the olive "got it / end trip" button. Default "primary". */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  /** Size — drives padding + icon size. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Leading icon name. */
  icon?: IconName;
  /** Trailing icon name. */
  iconRight?: IconName;
  /** Render the leading icon filled. Default false. */
  iconFilled?: boolean;
  children?: ReactNode;
}

/**
 * Primary action button. Tomato primary, warm focus ring, 44px min
 * tap target. Opt into a leading/trailing icon by name rather than
 * passing raw children, so icon sizing stays consistent.
 */
export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  iconFilled = false,
  className = "",
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    "gr-btn",
    `gr-btn--${size}`,
    `gr-btn--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={ICON_SIZE[size]} filled={iconFilled} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ICON_SIZE[size]} />}
    </button>
  );
}
