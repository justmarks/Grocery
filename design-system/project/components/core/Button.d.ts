import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { IconName } from "./Icon";

/**
 * The primary action control for the Grocery app.
 *
 * @startingPoint section="Core" subtitle="Tomato primary action button with icon options" viewport="700x160"
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. `success` is the olive "got it / end trip" button. Default "primary". */
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  /** Size — drives padding + icon size. Default "md". */
  size?: "sm" | "md" | "lg";
  /** Leading icon name. */
  icon?: IconName;
  /** Trailing icon name. */
  iconRight?: IconName;
  /** Render the leading icon filled. Default false. */
  iconFilled?: boolean;
  children?: ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
