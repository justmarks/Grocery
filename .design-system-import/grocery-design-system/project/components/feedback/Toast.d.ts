import type { ReactNode } from "react";

/** Bottom-center confirmation toast with an olive check. */
export interface ToastProps {
  children: ReactNode;
  /** Controls the slide/fade. The caller owns dismissal timing. */
  visible: boolean;
}

export function Toast(props: ToastProps): JSX.Element;
