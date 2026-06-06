import React from "react";
import { Icon } from "./Icon";

const ICON_SIZE = { sm: 14, md: 16, lg: 18 };

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
}) {
  const classes = [
    "gr-btn",
    `gr-btn--${size}`,
    `gr-btn--${variant}`,
    className,
  ].join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {icon && <Icon name={icon} size={ICON_SIZE[size]} filled={iconFilled} />}
      {children}
      {iconRight && <Icon name={iconRight} size={ICON_SIZE[size]} />}
    </button>
  );
}
