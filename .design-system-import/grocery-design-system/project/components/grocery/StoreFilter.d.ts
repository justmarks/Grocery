import type { HTMLAttributes } from "react";

/** Sticky single-store filter pills for shopping mode. */
export interface StoreFilterProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Household store names. */
  stores: string[];
  /** Active key — "all" or one of `stores`. Default "all". */
  value?: string;
  /** Called with the newly-selected key. */
  onChange?: (value: string) => void;
}

export function StoreFilter(props: StoreFilterProps): JSX.Element;
