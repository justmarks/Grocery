import React from "react";

/**
 * Standard text input. White card on cream paper, paper-400 border,
 * warm tomato focus halo. Use inside <Field> for the labelled pattern.
 */
export function Input({ className = "", type = "text", ...rest }) {
  return (
    <input type={type} className={["gr-input", className].join(" ")} {...rest} />
  );
}
