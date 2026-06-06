import type { ReactNode } from "react";

export interface FieldProps {
  /** Bold label shown above the control. */
  label: string;
  /** Helper text below the control (hidden when `error` is set). */
  hint?: string;
  /** Error text — overrides hint, rendered in tomato. */
  error?: string;
  children: ReactNode;
}

/**
 * Form-field wrapper: bold label above the control, optional hint or
 * error line below. Wraps children in a <label> so native
 * label-for-control association works without htmlFor.
 */
export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <label className="gr-field">
      <span className="gr-field__label">{label}</span>
      {children}
      {error ? (
        <span className="gr-field__error">{error}</span>
      ) : hint ? (
        <span className="gr-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}
