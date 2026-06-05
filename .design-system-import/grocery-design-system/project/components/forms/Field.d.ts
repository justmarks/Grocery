import type { ReactNode } from "react";

/** Labelled form-field wrapper with optional hint / error line. */
export interface FieldProps {
  /** Bold label shown above the control. */
  label: string;
  /** Helper text below the control (hidden when `error` is set). */
  hint?: string;
  /** Error text — overrides hint, rendered in tomato. */
  error?: string;
  children: ReactNode;
}

export function Field(props: FieldProps): JSX.Element;
