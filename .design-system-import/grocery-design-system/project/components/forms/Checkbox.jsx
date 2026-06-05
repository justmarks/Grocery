import React from "react";
import { Icon } from "../core/Icon";

/**
 * The big shopping-mode checkoff. A 28px rounded square that fills
 * olive with a white check when checked. Built as a real button with
 * role="checkbox" so it's keyboard- and screen-reader-friendly and
 * comfortably tappable (the row around it extends the hit area).
 */
export function Checkbox({
  checked = false,
  onChange,
  className = "",
  size = 28,
  ...rest
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange && onChange(!checked)}
      className={["gr-check", className].join(" ")}
      style={{ width: size, height: size }}
      {...rest}
    >
      <Icon name="check" size={Math.round(size * 0.62)} />
    </button>
  );
}
