import type { ButtonHTMLAttributes } from "react";

/** The big olive shopping-mode checkoff control. */
export interface CheckboxProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Checked state. Default false. */
  checked?: boolean;
  /** Called with the next checked value on tap. */
  onChange?: (checked: boolean) => void;
  /** Square edge in px. Default 28. */
  size?: number;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
