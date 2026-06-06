import type { HTMLAttributes } from "react";

/** The Plan / Shop segmented mode toggle. */
export interface ModeToggleProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Active mode. Default "plan". */
  value?: "plan" | "shop";
  /** Called with the newly-selected mode. */
  onChange?: (value: "plan" | "shop") => void;
}

export function ModeToggle(props: ModeToggleProps): JSX.Element;
