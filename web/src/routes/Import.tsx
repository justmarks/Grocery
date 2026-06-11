// /import?source=mealplan&payload=<base64url-json>
//
// Receives a meal-plan grocery list pushed from RecipeTracker. The
// payload shape + versioning + base64url codec all live in
// @grocery/shared/importPayload.ts so the client just calls
// decodeMealPlanPayload and renders the result.
//
// Flow:
//   1. Decode the payload. Four distinct failure modes get distinct
//      copy (decode / json / schema / unsupported version).
//   2. No household yet? Stash the URL in sessionStorage, send to
//      /setup. HouseholdSetup notices the stash and bounces back
//      after the user creates one.
//   3. Otherwise: render the preview. Items pre-sorted into the
//      household's section order; per-item store pills with catalog
//      prefill where known; a one-tap "Buy all at <store>" row.
//   4. Tap "Add to list" → batched commit with source: "mealplan",
//      navigate home + toast.

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  decodeMealPlanPayload,
  findExactCatalogMatch,
  GROCERY_CATEGORIES,
  stripPrepDirections,
  type DecodeResult,
  type GroceryCategory,
} from "@grocery/shared";
import {
  Brand,
  Button,
  CategoryTag,
  EmptyState,
  IconButton,
  Toast,
} from "../components/ui";
import { categoryLabel } from "../components/ui/grocery/categories";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";
import { useHousehold } from "../lib/household";
import { addItemsBatch } from "../lib/items";
import { useCatalog } from "../lib/catalog";

export const PENDING_IMPORT_KEY = "grocery.pendingImportUrl";

type Row = {
  index: number;
  text: string;
  category: GroceryCategory;
  stores: string[];
};

export function Import() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { userDoc, loading: userDocLoading } = useUserDoc(user?.uid ?? null);
  const { household } = useHousehold(userDoc?.householdId ?? null);
  const { catalog } = useCatalog(userDoc?.householdId ?? null);

  const source = params.get("source");
  const payloadParam = params.get("payload");

  const decoded: DecodeResult | null = useMemo(() => {
    if (source !== "mealplan" || !payloadParam) return null;
    return decodeMealPlanPayload(payloadParam);
  }, [source, payloadParam]);

  const [rows, setRows] = useState<Row[]>([]);
  const [rowsSeeded, setRowsSeeded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed local rows from the decoded payload, prefilling stores from
  // catalog entries where we already know the user's defaults. Runs
  // once per fresh payload; the user's edits aren't overwritten by
  // a later catalog snapshot.
  //
  // Prep directions ("Garlic, minced") are stripped here — at seed
  // time — so the preview, the catalog match, and the committed item
  // all see the same shopper-friendly text.
  useEffect(() => {
    if (rowsSeeded || !decoded || !decoded.ok) return;
    const seeded: Row[] = decoded.payload.items.map((item, i) => {
      const text = stripPrepDirections(item.text);
      const known = findExactCatalogMatch(catalog, text);
      return {
        index: i,
        text,
        category: (item.category as GroceryCategory),
        stores: known?.defaultStores ?? [],
      };
    });
    setRows(seeded);
    setRowsSeeded(true);
  }, [decoded, catalog, rowsSeeded]);

  // No-household trampoline: stash this URL so HouseholdSetup can
  // restore it post-creation, then redirect.
  useEffect(() => {
    if (userDocLoading || !user) return;
    if (userDoc && !userDoc.householdId) {
      const here = window.location.pathname + window.location.search;
      window.sessionStorage.setItem(PENDING_IMPORT_KEY, here);
      navigate("/setup", { replace: true });
    }
  }, [user, userDoc, userDocLoading, navigate]);

  // No source / no payload → bad link. Surface that distinctly.
  if (source !== "mealplan" || !payloadParam) {
    return (
      <ImportShell>
        <EmptyState icon="x" title="That import link looks incomplete.">
          The link is missing the meal plan payload. Try sharing it again from
          RecipeTracker.
        </EmptyState>
        <BackToList />
      </ImportShell>
    );
  }

  if (!decoded) return null;

  if (!decoded.ok) {
    return (
      <ImportShell>
        <DecodeError reason={decoded.reason} />
        <BackToList />
      </ImportShell>
    );
  }

  if (!household || !rowsSeeded) {
    return (
      <ImportShell>
        <EmptyState icon="mail" title="Loading import…">
          Just a sec.
        </EmptyState>
      </ImportShell>
    );
  }

  if (rows.length === 0) {
    return (
      <ImportShell>
        <EmptyState icon="x" title="Nothing left to import.">
          You skipped every item. Tap "Not now" to head back to your list.
        </EmptyState>
        <BackToList />
      </ImportShell>
    );
  }

  const categoryOrder = household.categoryOrder;
  const stores = household.stores;
  const orderIndex = new Map<GroceryCategory, number>();
  categoryOrder.forEach((c, i) => orderIndex.set(c, i));
  const sortedRows = [...rows].sort((a, b) => {
    const ai = orderIndex.get(a.category) ?? Number.MAX_SAFE_INTEGER;
    const bi = orderIndex.get(b.category) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    return a.index - b.index;
  });

  function applyStoreToAll(store: string) {
    setRows((prev) => prev.map((r) => ({ ...r, stores: [store] })));
  }

  function toggleRowStore(rowIdx: number, store: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.index === rowIdx
          ? {
              ...r,
              stores: r.stores.includes(store)
                ? r.stores.filter((s) => s !== store)
                : [...r.stores, store],
            }
          : r,
      ),
    );
  }

  function changeRowCategory(rowIdx: number, category: GroceryCategory) {
    setRows((prev) =>
      prev.map((r) => (r.index === rowIdx ? { ...r, category } : r)),
    );
  }

  function removeRow(rowIdx: number) {
    setRows((prev) => prev.filter((r) => r.index !== rowIdx));
  }

  async function handleCommit() {
    if (!household || !user || busy || !decoded || !decoded.ok) return;
    setBusy(true);
    setError(null);
    try {
      const count = await addItemsBatch(
        household.id,
        user.uid,
        rows.map((r) => ({
          text: r.text,
          category: r.category,
          stores: r.stores,
          quantity: 1,
        })),
        {
          source: "mealplan",
          sourceRef: { mealPlanId: decoded.payload.mealPlanId },
        },
      );
      setCommitted(true);
      // Stay on the page for a beat so the toast reads; then go home.
      window.setTimeout(() => {
        navigate("/", {
          replace: true,
          state: {
            toast: `Added ${count} item${count === 1 ? "" : "s"} from ${decoded.payload.mealPlanName}`,
          },
        });
      }, 1400);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[import] commit:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't add the items. Please try again.",
      );
      setBusy(false);
    }
  }

  return (
    <ImportShell>
      <p
        style={{
          color: "var(--ink-500)",
          fontSize: "var(--text-xs)",
          textTransform: "uppercase",
          letterSpacing: "var(--tracking-caps)",
          fontWeight: 600,
          margin: 0,
        }}
      >
        From RecipeTracker
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "var(--text-2xl)",
          letterSpacing: "var(--tracking-tight)",
          margin: "var(--space-2) 0 var(--space-1)",
        }}
      >
        {decoded.payload.mealPlanName}
      </h1>
      <p
        style={{
          color: "var(--ink-500)",
          fontSize: "var(--text-sm)",
          margin: "0 0 var(--space-6)",
        }}
      >
        {rows.length} item{rows.length === 1 ? "" : "s"} to add to{" "}
        <strong>{household.name}</strong>.
      </p>

      {stores.length > 0 && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-faint)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
            marginBottom: "var(--space-5)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-sm)",
              color: "var(--ink-500)",
              marginRight: "var(--space-1)",
            }}
          >
            Buy all at
          </span>
          {stores.map((s) => (
            <button
              key={s}
              type="button"
              className="gr-chip"
              onClick={() => applyStoreToAll(s)}
              disabled={busy}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {sortedRows.map((r) => (
          <li
            key={r.index}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-faint)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-3) var(--space-3)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-2)",
              }}
            >
              <CategoryPicker
                value={r.category}
                onChange={(c) => changeRowCategory(r.index, c)}
                disabled={busy}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: "var(--text-md)",
                  color: "var(--ink-900)",
                  paddingTop: "var(--space-1)",
                }}
              >
                {r.text}
              </span>
              <IconButton
                icon="trash"
                variant="danger"
                size={16}
                aria-label={`Skip ${r.text}`}
                disabled={busy}
                onClick={() => removeRow(r.index)}
              />
            </div>
            {stores.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--space-2)",
                  paddingLeft: "var(--space-1)",
                }}
              >
                {stores.map((s) => {
                  const active = r.stores.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      className="gr-chip"
                      aria-pressed={active}
                      onClick={() => toggleRowStore(r.index, s)}
                      disabled={busy}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p
          role="alert"
          style={{
            marginTop: "var(--space-4)",
            color: "var(--tomato-700)",
            fontSize: "var(--text-sm)",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--paper-100)",
          marginTop: "var(--space-6)",
          paddingTop: "var(--space-3)",
          paddingBottom: "calc(var(--space-3) + env(safe-area-inset-bottom))",
          borderTop: "1px solid var(--border-faint)",
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "center",
        }}
      >
        <span style={{ flex: 1 }} />
        <Button
          variant="ghost"
          onClick={() => navigate("/", { replace: true })}
          disabled={busy}
        >
          Not now
        </Button>
        <Button
          icon={busy ? undefined : "check"}
          onClick={handleCommit}
          disabled={busy || committed || rows.length === 0}
        >
          {busy
            ? "Adding…"
            : committed
              ? "Added"
              : `Add ${rows.length} item${rows.length === 1 ? "" : "s"}`}
        </Button>
      </div>

      <Toast visible={committed}>
        Added {rows.length} item{rows.length === 1 ? "" : "s"} from{" "}
        {decoded.payload.mealPlanName}
      </Toast>
    </ImportShell>
  );
}

// ---------- subcomponents ----------

function ImportShell({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--paper-100)",
        color: "var(--ink-900)",
        fontFamily: "var(--font-sans)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <Brand variant="lockup" />
        <IconButton
          icon="log-out"
          aria-label="Sign out"
          onClick={() => signOut()}
        />
      </header>
      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "var(--space-6) var(--space-5) var(--space-5)",
        }}
      >
        {children}
      </main>
    </div>
  );
}

function DecodeError({ reason }: { reason: DecodeResult & { ok: false } extends infer T ? (T extends { reason: infer R } ? R : never) : never }) {
  const copy: Record<string, { title: string; body: string }> = {
    "decode-failed": {
      title: "That link is malformed.",
      body: "The payload couldn't be decoded. Re-share the meal plan from RecipeTracker.",
    },
    "json-invalid": {
      title: "That link is corrupted.",
      body: "Re-share the meal plan from RecipeTracker.",
    },
    "schema-mismatch": {
      title: "That link doesn't match what Grocery expects.",
      body: "RecipeTracker may have shipped a change Grocery hasn't seen yet — try updating Grocery first.",
    },
    "unsupported-version": {
      title: "RecipeTracker is newer than Grocery.",
      body: "Update Grocery (reload the page, or reinstall the PWA), then click the link again.",
    },
  };
  const m = copy[reason] ?? copy["json-invalid"];
  return (
    <EmptyState icon="x" title={m.title}>
      {m.body}
    </EmptyState>
  );
}

function BackToList() {
  const navigate = useNavigate();
  return (
    <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
      <Button
        variant="ghost"
        icon="arrow-left"
        onClick={() => navigate("/", { replace: true })}
      >
        Back to your list
      </Button>
    </div>
  );
}

function CategoryPicker({
  value,
  onChange,
  disabled,
}: {
  value: GroceryCategory;
  onChange: (c: GroceryCategory) => void;
  disabled?: boolean;
}) {
  // Renders as the CategoryTag chip + a hidden native select layered
  // on top so tap opens the OS-native picker. Keeps the chip styling
  // (and category color) but gets accessibility + mobile keyboarding
  // for free.
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        flex: "0 0 auto",
      }}
    >
      <CategoryTag category={value} />
      <select
        aria-label="Aisle"
        value={value}
        onChange={(e) => onChange(e.target.value as GroceryCategory)}
        disabled={disabled}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          cursor: "pointer",
        }}
      >
        {GROCERY_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {categoryLabel(c)}
          </option>
        ))}
      </select>
    </span>
  );
}

