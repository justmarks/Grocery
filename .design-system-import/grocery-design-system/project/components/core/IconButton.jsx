import React from "react";
import { Icon } from "./Icon";

/**
 * A square, borderless icon-only button — row actions (edit, delete),
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
}) {
  const classes = [
    "gr-iconbtn",
    variant === "danger" ? "gr-iconbtn--danger" : "",
    className,
  ].join(" ");
  return (
    <button type={type} className={classes} {...rest}>
      <Icon name={icon} size={size} filled={filled} />
    </button>
  );
}
