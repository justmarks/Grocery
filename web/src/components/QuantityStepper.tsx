// A +/- stepper for the quantity field. JetBrains Mono for the
// number to match the design guide's "counts read like a kitchen"
// rule. 44px tap target on each button via IconButton.

import { Icon } from "./ui";

export type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  disabled = false,
}: QuantityStepperProps) {
  function step(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta));
    if (next !== value) onChange(next);
  }
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        border: "1px solid var(--paper-400)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-1)",
        background: "var(--bg-card)",
      }}
    >
      <button
        type="button"
        className="gr-iconbtn"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => step(-1)}
      >
        <Icon name="minus" size={18} />
      </button>
      <span
        aria-live="polite"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-base)",
          minWidth: "var(--space-8)",
          textAlign: "center",
          color: "var(--ink-900)",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        className="gr-iconbtn"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => step(1)}
      >
        <Icon name="plus" size={18} />
      </button>
    </div>
  );
}
