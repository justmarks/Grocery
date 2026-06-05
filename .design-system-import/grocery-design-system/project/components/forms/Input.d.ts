import type { InputHTMLAttributes } from "react";

/** Standard text input — white on cream, tomato focus halo, 8px radius. */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps): JSX.Element;
