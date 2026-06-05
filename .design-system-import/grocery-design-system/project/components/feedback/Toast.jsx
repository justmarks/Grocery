import React from "react";
import { Icon } from "../core/Icon";

/**
 * Bottom-center confirmation toast. Slides up + fades in over 200ms.
 * The one piece of "playful" motion in the system. Stateless — the
 * caller controls `visible`; pair with a setTimeout for auto-dismiss
 * (typically 2.5–3s). Always carries an olive check (the saved/added
 * affordance).
 */
export function Toast({ children, visible }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="gr-toast"
      style={{
        position: "fixed",
        bottom: 96,
        left: "50%",
        zIndex: 50,
        pointerEvents: "none",
        transform: visible ? "translate(-50%, 0)" : "translate(-50%, 20px)",
        opacity: visible ? 1 : 0,
        transition:
          "transform 200ms cubic-bezier(0.22,1,0.36,1), opacity 200ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      <span className="gr-toast__icon">
        <Icon name="check" size={16} />
      </span>
      {children}
    </div>
  );
}
