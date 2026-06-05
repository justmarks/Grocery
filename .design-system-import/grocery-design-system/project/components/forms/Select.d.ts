import type { SelectHTMLAttributes } from "react";

/** Standard select with a custom chevron, matching Input's chrome. */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select(props: SelectProps): JSX.Element;
