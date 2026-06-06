import type { InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Standard text input. White card on cream paper, paper-400 border,
 * warm tomato focus halo. Use inside <Field> for the labelled pattern.
 */
export function Input({ className = "", type = "text", ...rest }: InputProps) {
  return (
    <input
      type={type}
      className={["gr-input", className].filter(Boolean).join(" ")}
      {...rest}
    />
  );
}
