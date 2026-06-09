// Settings — Phase 2 rename + stores + aisle-order editor. Settings
// reads from the live household doc (via useHousehold) and commits
// with one "Save changes" action. Category reorder uses arrow
// buttons for now — a drag-and-drop polish pass can land later
// without changing the data shape.
//
// Page-level state mirrors the household doc; "dirty" is computed
// by comparing current state to the source. Members management and
// invites are deferred to Phase 7.

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import type { GroceryCategory } from "@grocery/shared";
import {
  Brand,
  Button,
  Field,
  IconButton,
  Input,
  StoreLogo,
  Toast,
} from "../components/ui";
import { CategoryOrderList } from "../components/CategoryOrderList";
import { MembersSection } from "../components/MembersSection";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";
import { updateHouseholdMetadata, useHousehold } from "../lib/household";
import { fileToStoreLogo } from "../lib/imageResize";

function arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function recordsEqual(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every((k) => a[k] === b[k]);
}

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userDoc, loading: userDocLoading } = useUserDoc(user?.uid ?? null);
  const { household, loading: householdLoading } = useHousehold(
    userDoc?.householdId ?? null,
  );

  // Local form state — re-seeded any time the household snapshot
  // changes (so a co-member's save flows in without conflict).
  const [name, setName] = useState("");
  const [stores, setStores] = useState<string[]>([]);
  const [storeLogos, setStoreLogos] = useState<Record<string, string>>({});
  const [categoryOrder, setCategoryOrder] = useState<GroceryCategory[]>([]);
  const [newStore, setNewStore] = useState("");

  const [busy, setBusy] = useState(false);
  const [logoBusyStore, setLogoBusyStore] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!household) return;
    setName(household.name);
    setStores(household.stores);
    setStoreLogos(household.storeLogos ?? {});
    setCategoryOrder(household.categoryOrder);
  }, [household?.id, household?.updatedAt, household]);

  const dirty = useMemo(() => {
    if (!household) return false;
    return (
      name.trim() !== household.name
      || !arraysEqual(stores, household.stores)
      || !arraysEqual(categoryOrder, household.categoryOrder)
      || !recordsEqual(storeLogos, household.storeLogos ?? {})
    );
  }, [name, stores, categoryOrder, storeLogos, household]);

  // No household → bounce to setup. But ONLY once the user doc has
  // actually loaded — Settings mounts a fresh useUserDoc, so userDoc
  // is briefly null on the first render. The old guard keyed off the
  // household hook's loading flag, which is fed `null` (→ reports
  // "not loading") while the user doc is still in flight, so it
  // misread that first frame as "no household" and bounced to /setup
  // → / . Wait for userDocLoading, and require a resolved doc with a
  // genuinely empty householdId before redirecting.
  if (!userDocLoading && userDoc != null && userDoc.householdId == null) {
    return <Navigate to="/setup" replace />;
  }

  function removeStore(idx: number) {
    const name = stores[idx];
    setStores((prev) => prev.filter((_, i) => i !== idx));
    // Drop the removed store's logo too, so the saved map stays in
    // sync with the stores list.
    setStoreLogos((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleLogoPick(store: string, file: File | undefined) {
    if (!file) return;
    setLogoBusyStore(store);
    setError(null);
    try {
      const { dataUrl } = await fileToStoreLogo(file);
      setStoreLogos((prev) => ({ ...prev, [store]: dataUrl }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[settings] logo:", err);
      setError(
        err instanceof Error ? err.message : "Couldn't process that image.",
      );
    } finally {
      setLogoBusyStore(null);
    }
  }

  function removeLogo(store: string) {
    setStoreLogos((prev) => {
      if (!(store in prev)) return prev;
      const next = { ...prev };
      delete next[store];
      return next;
    });
  }

  function addStore() {
    const candidate = newStore.trim();
    if (!candidate) return;
    if (stores.some((s) => s.toLowerCase() === candidate.toLowerCase())) {
      setError(`"${candidate}" is already in the list.`);
      return;
    }
    setStores((prev) => [...prev, candidate]);
    setNewStore("");
    setError(null);
  }

  async function handleSave() {
    if (!household || !dirty) return;
    if (stores.length === 0) {
      setError("Add at least one store before saving.");
      return;
    }
    if (!name.trim()) {
      setError("Household name can't be empty.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateHouseholdMetadata(household.id, {
        name: name.trim(),
        stores,
        categoryOrder,
        storeLogos,
      });
      setToast(true);
      window.setTimeout(() => setToast(false), 2500);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[settings] save:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't save changes. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

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
          gap: "var(--space-3)",
          padding: "var(--space-4) var(--space-5)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <IconButton
          icon="arrow-left"
          aria-label="Back"
          onClick={() => navigate(-1)}
        />
        <Brand variant="lockup" />
      </header>

      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "var(--space-6) var(--space-5) var(--space-20)",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-2xl)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 var(--space-6)",
          }}
        >
          Settings
        </h1>

        {householdLoading || !household ? (
          <p style={{ color: "var(--ink-500)" }}>Loading…</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-8)",
            }}
          >
            {/* ---------- Household name ---------- */}
            <section>
              <SectionHeader>Household</SectionHeader>
              <Field label="Name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  disabled={busy}
                />
              </Field>
            </section>

            {/* ---------- Members ---------- */}
            {user && (
              <MembersSection
                household={household}
                currentUid={user.uid}
                currentDisplayName={
                  userDoc?.displayName ?? user.displayName ?? user.email ?? ""
                }
              />
            )}

            {/* ---------- Stores ---------- */}
            <section>
              <SectionHeader>Stores</SectionHeader>
              <p
                style={{
                  margin: "0 0 var(--space-3)",
                  color: "var(--ink-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                The stores you shop at. Each item can be available at one or
                more of these. Tap a store's logo to upload one — it shows on
                the shop-mode filter.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                }}
              >
                {stores.map((s, i) => (
                  <li
                    key={s + "-" + i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-faint)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-2) var(--space-3)",
                    }}
                  >
                    <label
                      title={`Upload a logo for ${s}`}
                      style={{
                        flex: "none",
                        cursor: busy || logoBusyStore === s ? "default" : "pointer",
                        borderRadius: "var(--radius-pill)",
                        display: "inline-flex",
                        opacity: logoBusyStore === s ? 0.5 : 1,
                      }}
                    >
                      <StoreLogo name={s} logo={storeLogos[s]} size={40} />
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        style={{ display: "none" }}
                        disabled={busy || logoBusyStore === s}
                        onChange={(e) => {
                          handleLogoPick(s, e.target.files?.[0]);
                          // reset so re-picking the same file refires onChange
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "var(--ink-900)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s}
                      </div>
                      <div
                        style={{
                          fontSize: "var(--text-xs)",
                          color: "var(--ink-500)",
                        }}
                      >
                        {logoBusyStore === s
                          ? "Processing…"
                          : storeLogos[s]
                            ? "Tap logo to change"
                            : "Tap logo to add"}
                      </div>
                    </div>
                    {storeLogos[s] && (
                      <IconButton
                        icon="x"
                        aria-label={`Remove logo for ${s}`}
                        disabled={busy}
                        onClick={() => removeLogo(s)}
                      />
                    )}
                    <IconButton
                      icon="trash"
                      variant="danger"
                      aria-label={`Remove ${s}`}
                      disabled={busy || stores.length === 1}
                      onClick={() => removeStore(i)}
                    />
                  </li>
                ))}
              </ul>
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-3)",
                  alignItems: "stretch",
                }}
              >
                <Input
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  placeholder="Add a store"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addStore();
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  icon="plus"
                  onClick={addStore}
                  disabled={busy || !newStore.trim()}
                >
                  Add
                </Button>
              </div>
            </section>

            {/* ---------- Aisle order ---------- */}
            <section>
              <SectionHeader>Aisle order</SectionHeader>
              <p
                style={{
                  margin: "0 0 var(--space-3)",
                  color: "var(--ink-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                The order sections show up — both when planning and when
                shopping. Drag the handle to match how you actually walk the
                store.
              </p>
              <CategoryOrderList
                order={categoryOrder}
                onChange={setCategoryOrder}
                disabled={busy}
              />
            </section>

            {/* ---------- Save bar ---------- */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: "var(--paper-100)",
                paddingTop: "var(--space-3)",
                paddingBottom: "var(--space-3)",
                marginInline: "calc(-1 * var(--space-5))",
                paddingInline: "var(--space-5)",
                borderTop: "1px solid var(--border-faint)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <span style={{ flex: 1, color: "var(--ink-500)", fontSize: "var(--text-sm)" }}>
                {dirty ? "Unsaved changes." : "All saved."}
              </span>
              <Button
                variant="ghost"
                disabled={!dirty || busy}
                onClick={() => {
                  if (!household) return;
                  setName(household.name);
                  setStores(household.stores);
                  setStoreLogos(household.storeLogos ?? {});
                  setCategoryOrder(household.categoryOrder);
                  setError(null);
                }}
              >
                Discard
              </Button>
              <Button
                onClick={handleSave}
                disabled={!dirty || busy}
                icon={busy ? undefined : "check"}
              >
                {busy ? "Saving…" : "Save changes"}
              </Button>
            </div>

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
                background: "var(--paper-200)",
                border: "1px solid var(--border-faint)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
                fontSize: "var(--text-sm)",
                color: "var(--ink-700)",
                lineHeight: 1.5,
              }}
            >
              <strong>Import from RecipeTracker:</strong>{" "}
              send a meal plan from RecipeTracker — it'll open here.
            </div>

            <p
              style={{
                color: "var(--ink-500)",
                fontSize: "var(--text-sm)",
                margin: 0,
              }}
            >
              <Link to="/" style={{ color: "var(--fg-link)" }}>
                Back to list
              </Link>
            </p>
          </div>
        )}
      </main>

      <Toast visible={toast}>Saved.</Toast>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        fontSize: "var(--text-xs)",
        textTransform: "uppercase",
        letterSpacing: "var(--tracking-caps)",
        color: "var(--ink-500)",
        margin: "0 0 var(--space-3)",
      }}
    >
      {children}
    </h2>
  );
}
