// Bottom-sheet editor for a single item. Shared between "edit
// existing" (pencil on a row) and any future "add detailed" flow.
// Read-mode (shopping) uses the simpler row checkoff; this sheet is
// plan-mode only.

import { useEffect, useState } from "react";
import {
  GROCERY_CATEGORIES,
  type GroceryCategory,
} from "@grocery/shared";
import { Button, Field, IconButton, Input, Select, StoreLogo } from "./ui";
import { categoryLabel } from "./ui/grocery/categories";
import { QuantityStepper } from "./QuantityStepper";

export type EditItemDraft = {
  text: string;
  quantity: number;
  category: GroceryCategory;
  stores: string[];
};

export type EditItemSheetProps = {
  open: boolean;
  title: string;
  initial: EditItemDraft;
  /** Stores configured on the household — drives the multi-select discs. */
  availableStores: string[];
  /** Optional per-store logo data URLs, keyed by store name. */
  storeLogos?: Record<string, string>;
  /** Saving — disables fields and shows the busy label. */
  saving?: boolean;
  /** Error message rendered below the form. */
  error?: string | null;
  onClose: () => void;
  onSave: (draft: EditItemDraft) => void;
  /** Shown for existing items; omit for new items. */
  onDelete?: () => void;
};

export function EditItemSheet({
  open,
  title,
  initial,
  availableStores,
  storeLogos,
  saving = false,
  error = null,
  onClose,
  onSave,
  onDelete,
}: EditItemSheetProps) {
  const [draft, setDraft] = useState<EditItemDraft>(initial);

  // Re-seed when the sheet opens for a different item.
  useEffect(() => {
    if (open) setDraft(initial);
  }, [open, initial.text, initial.quantity, initial.category, initial]);

  if (!open) return null;

  function toggleStore(store: string) {
    setDraft((d) => {
      const has = d.stores.includes(store);
      return {
        ...d,
        stores: has ? d.stores.filter((s) => s !== store) : [...d.stores, store],
      };
    });
  }

  const canSave = draft.text.trim().length > 0 && !saving;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(42, 31, 24, 0.4)",
          border: "none",
          cursor: "default",
        }}
      />
      <section
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 560,
          background: "var(--bg-card)",
          borderTopLeftRadius: "var(--radius-xl)",
          borderTopRightRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          padding:
            "var(--space-5) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom))",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-3)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "var(--text-xl)",
              letterSpacing: "var(--tracking-tight)",
              margin: 0,
            }}
          >
            {title}
          </h2>
          <IconButton icon="x" aria-label="Close" onClick={onClose} />
        </header>

        <Field label="Item">
          <Input
            autoFocus
            value={draft.text}
            onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
            maxLength={280}
            disabled={saving}
            placeholder="Lemons"
          />
        </Field>

        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Field label="Quantity">
            <QuantityStepper
              value={draft.quantity}
              onChange={(q) => setDraft((d) => ({ ...d, quantity: q }))}
              disabled={saving}
            />
          </Field>
          <div style={{ flex: 1, minWidth: 180 }}>
            <Field label="Aisle">
              <Select
                value={draft.category}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    category: e.target.value as GroceryCategory,
                  }))
                }
                disabled={saving}
              >
                {GROCERY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>

        {availableStores.length > 0 && (
          <Field label="Stores" hint="Tap the stores this item is available at.">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              {availableStores.map((s) => {
                const active = draft.stores.includes(s);
                return (
                  // Same disc treatment as the shop-mode StoreFilter:
                  // logo (or monogram) with a tomato ring when selected.
                  <button
                    key={s}
                    type="button"
                    aria-label={s}
                    aria-pressed={active}
                    title={s}
                    onClick={() => toggleStore(s)}
                    disabled={saving}
                    style={{
                      flex: "0 0 auto",
                      padding: 2,
                      border: "none",
                      borderRadius: "var(--radius-pill)",
                      background: "transparent",
                      cursor: saving ? "default" : "pointer",
                      display: "inline-flex",
                      opacity: active ? 1 : 0.6,
                      boxShadow: active
                        ? "0 0 0 2px var(--tomato-500)"
                        : "0 0 0 1px var(--border-faint)",
                      transition:
                        "opacity var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)",
                    }}
                  >
                    <StoreLogo name={s} logo={storeLogos?.[s]} size={40} />
                  </button>
                );
              })}
            </div>
          </Field>
        )}

        {error && (
          <p
            role="alert"
            style={{
              color: "var(--tomato-700)",
              fontSize: "var(--text-sm)",
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "var(--space-2)",
            alignItems: "center",
          }}
        >
          {onDelete && (
            <Button
              variant="danger"
              icon="trash"
              onClick={onDelete}
              disabled={saving}
            >
              Delete
            </Button>
          )}
          <span style={{ flex: 1 }} />
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={() => onSave(draft)}
            disabled={!canSave}
            icon={saving ? undefined : "check"}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </section>
    </div>
  );
}
