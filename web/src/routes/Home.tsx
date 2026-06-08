// Home — plan + shop modes share the list, sectioning, and toast
// machinery; they differ in chrome (composer vs end-trip bar) and
// per-row trailing slot (edit/delete pencil-trash vs nothing). The
// sticky top region (header + mode toggle + store filter) scrolls
// as one block so the controls stay reachable while a long list
// scrolls underneath.
//
// State that survives reloads (in localStorage):
//   grocery.home.grouping  — "aisle" | "store" (plan mode)
//   grocery.shop.store     — "all" | <store name> (shop mode)

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  findCatalogSuggestions,
  findExactCatalogMatch,
  groupByAisle,
  groupByStore,
  itemAddedAtMillis,
  type CatalogEntryWithId,
  type GroceryCategory,
} from "@grocery/shared";
import {
  AisleHeader,
  Avatar,
  Brand,
  Button,
  CategoryTag,
  EmptyState,
  GroceryItemRow,
  Icon,
  IconButton,
  Input,
  ModeToggle,
  StoreFilter,
  Toast,
  type Mode,
} from "../components/ui";
import {
  EditItemSheet,
  type EditItemDraft,
} from "../components/EditItemSheet";
import { CollapsibleSection } from "../components/CollapsibleSection";
import { categoryLabel } from "../components/ui/grocery/categories";
import { useAuth } from "../lib/useAuth";
import { useUserDoc } from "../lib/userDoc";
import { useHousehold } from "../lib/household";
import {
  addItem,
  clearCheckedItems,
  deleteItem,
  toggleItemChecked,
  updateItem,
  useItems,
  type ItemWithId,
} from "../lib/items";
import { useCatalog } from "../lib/catalog";

type Grouping = "aisle" | "store";
const GROUPING_KEY = "grocery.home.grouping";
const STORE_FILTER_KEY = "grocery.shop.store";

const EMPTY_STORES: string[] = [];
const UNASSIGNED_LABEL = "No store yet";

function readGrouping(): Grouping {
  if (typeof window === "undefined") return "aisle";
  const raw = window.localStorage.getItem(GROUPING_KEY);
  return raw === "store" ? "store" : "aisle";
}
function readStoreFilter(): string {
  if (typeof window === "undefined") return "all";
  return window.localStorage.getItem(STORE_FILTER_KEY) ?? "all";
}

export function Home() {
  const { user, signOut } = useAuth();
  const { userDoc } = useUserDoc(user?.uid ?? null);
  const { household } = useHousehold(userDoc?.householdId ?? null);
  const { items, loading: itemsLoading } = useItems(
    userDoc?.householdId ?? null,
  );
  const { catalog } = useCatalog(userDoc?.householdId ?? null);

  const [mode, setMode] = useState<Mode>("plan");
  const [grouping, setGrouping] = useState<Grouping>(readGrouping);
  const [storeFilter, setStoreFilter] = useState<string>(readStoreFilter);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<ItemWithId | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetSaving, setSheetSaving] = useState(false);
  const [endingTrip, setEndingTrip] = useState(false);

  const [collapsedAisles, setCollapsedAisles] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedStores, setCollapsedStores] = useState<Set<string>>(
    () => new Set(),
  );

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  function flashToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2500);
  }

  // Read location.state.toast set by Import.tsx on successful commit
  // so the success message lands on Home rather than vanishing mid-
  // navigation. Clears state so a reload doesn't replay the toast.
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const state = location.state as { toast?: string } | null;
    if (state?.toast) {
      flashToast(state.toast);
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.localStorage.setItem(GROUPING_KEY, grouping);
  }, [grouping]);
  useEffect(() => {
    window.localStorage.setItem(STORE_FILTER_KEY, storeFilter);
  }, [storeFilter]);
  // If the household's stores list changes and the saved filter is
  // no longer valid (store was renamed/removed), fall back to "all".
  useEffect(() => {
    if (storeFilter === "all" || !household) return;
    if (!household.stores.includes(storeFilter)) setStoreFilter("all");
  }, [household, storeFilter]);

  const displayName =
    userDoc?.displayName ?? user?.displayName ?? user?.email ?? "Friend";
  const photoURL = userDoc?.photoURL ?? user?.photoURL ?? undefined;

  const categoryOrder = household?.categoryOrder ?? [];
  const stores = household?.stores ?? EMPTY_STORES;

  const groupableItems = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        addedAtMillis: itemAddedAtMillis(it),
      })),
    [items],
  );

  // Apply the shop-mode store filter before grouping so the section
  // counts only reflect what the user can actually see right now.
  const shopVisibleItems = useMemo(() => {
    if (storeFilter === "all") return groupableItems;
    return groupableItems.filter((it) => it.stores.includes(storeFilter));
  }, [groupableItems, storeFilter]);

  const aisleGroupsPlan = useMemo(
    () => groupByAisle(groupableItems, categoryOrder),
    [groupableItems, categoryOrder],
  );
  const aisleGroupsShop = useMemo(
    () => groupByAisle(shopVisibleItems, categoryOrder),
    [shopVisibleItems, categoryOrder],
  );
  const storeGroupsPlan = useMemo(
    () => groupByStore(groupableItems, stores, categoryOrder),
    [groupableItems, stores, categoryOrder],
  );

  // Shop-mode progress + end-trip availability are scoped to the
  // visible items (i.e., respect the store filter). End-trip itself
  // clears household-wide checked items — see handleEndTrip below.
  const visibleCheckedCount = useMemo(
    () => shopVisibleItems.filter((i) => i.checked).length,
    [shopVisibleItems],
  );
  const householdCheckedCount = useMemo(
    () => items.filter((i) => i.checked).length,
    [items],
  );

  const suggestions = useMemo(
    () => findCatalogSuggestions(catalog, draft, 3),
    [catalog, draft],
  );

  function toggleCollapsedAisle(slug: string) {
    setCollapsedAisles((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }
  function toggleCollapsedStore(store: string) {
    setCollapsedStores((prev) => {
      const next = new Set(prev);
      if (next.has(store)) next.delete(store);
      else next.add(store);
      return next;
    });
  }

  async function handleQuickAdd(fromSuggestion?: CatalogEntryWithId) {
    if (!household || !user) return;
    const text = (fromSuggestion?.text ?? draft).trim();
    if (!text) return;
    const remembered =
      fromSuggestion ?? findExactCatalogMatch(catalog, text) ?? null;
    setDraft("");
    try {
      await addItem(household.id, user.uid, {
        text,
        category: remembered?.defaultCategory,
        stores: remembered?.defaultStores,
        quantity: remembered?.defaultQuantity,
      });
      flashToast(`Added ${text}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[home] addItem:", err);
      flashToast(`Couldn't add ${text}`);
      setDraft(text);
    }
  }

  async function handleToggle(item: ItemWithId) {
    if (!household || !user) return;
    try {
      await toggleItemChecked(household.id, item.id, !item.checked, user.uid);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[home] toggle:", err);
      flashToast("Couldn't update");
    }
  }

  async function handleSheetSave(next: EditItemDraft) {
    if (!editing || !household) return;
    setSheetSaving(true);
    setSheetError(null);
    try {
      await updateItem(household.id, editing.id, {
        text: next.text,
        quantity: next.quantity,
        category: next.category,
        stores: next.stores,
      });
      flashToast(`Updated ${next.text}`);
      setEditing(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[home] updateItem:", err);
      setSheetError(
        err instanceof Error
          ? err.message
          : "Couldn't save changes. Please try again.",
      );
    } finally {
      setSheetSaving(false);
    }
  }

  async function handleSheetDelete() {
    if (!editing || !household) return;
    const removed = editing.text;
    setSheetSaving(true);
    setSheetError(null);
    try {
      await deleteItem(household.id, editing.id);
      flashToast(`Removed ${removed}`);
      setEditing(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[home] deleteItem:", err);
      setSheetError(
        err instanceof Error
          ? err.message
          : "Couldn't delete. Please try again.",
      );
    } finally {
      setSheetSaving(false);
    }
  }

  async function handleRowDelete(item: ItemWithId) {
    if (!household) return;
    try {
      await deleteItem(household.id, item.id);
      flashToast(`Removed ${item.text}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[home] row delete:", err);
      flashToast(`Couldn't remove ${item.text}`);
    }
  }

  async function handleEndTrip() {
    if (!household || endingTrip) return;
    setEndingTrip(true);
    try {
      const cleared = await clearCheckedItems(household.id);
      flashToast(
        cleared === 0
          ? "Nothing checked off."
          : `Trip ended — ${cleared} item${cleared === 1 ? "" : "s"} cleared`,
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[home] endTrip:", err);
      flashToast("Couldn't end trip");
    } finally {
      setEndingTrip(false);
    }
  }

  const isEmpty = !itemsLoading && items.length === 0;
  const shopIsEmpty = !itemsLoading && shopVisibleItems.length === 0;
  const allCheckedInFilteredView =
    !shopIsEmpty
    && shopVisibleItems.length > 0
    && shopVisibleItems.every((i) => i.checked);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--paper-100)",
        color: "var(--ink-900)",
        fontFamily: "var(--font-sans)",
        paddingBottom: 96, // room for the sticky bottom bar
      }}
    >
      {/* Sticky top assembly — header + mode toggle + store filter. */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--paper-100)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-3) var(--space-5)",
          }}
        >
          <Brand variant="lockup" />
          <div
            style={{
              display: "flex",
              gap: "var(--space-1)",
              alignItems: "center",
            }}
          >
            <Avatar name={displayName} src={photoURL} size={32} />
            <IconButton
              icon="settings"
              aria-label="Settings"
              onClick={() => navigate("/settings")}
            />
            <IconButton
              icon="log-out"
              aria-label="Sign out"
              onClick={() => signOut()}
            />
          </div>
        </header>

        <div
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding: "0 var(--space-5) var(--space-3)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            flexWrap: "wrap",
          }}
        >
          <ModeToggle value={mode} onChange={setMode} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-sm)",
              color: mode === "shop" ? "var(--olive-700)" : "var(--ink-500)",
            }}
          >
            {mode === "shop"
              ? `${visibleCheckedCount}/${shopVisibleItems.length} in the cart`
              : `${items.length} item${items.length === 1 ? "" : "s"}`}
          </span>
          {mode === "plan" && !isEmpty && (
            <>
              <span
                style={{
                  marginLeft: "auto",
                  color: "var(--ink-500)",
                  fontSize: "var(--text-sm)",
                }}
              >
                Group by
              </span>
              <GroupingToggle value={grouping} onChange={setGrouping} />
            </>
          )}
        </div>

        {mode === "shop" && stores.length > 0 && (
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "0 var(--space-5) var(--space-3)",
            }}
          >
            <StoreFilter
              stores={stores}
              value={storeFilter}
              onChange={setStoreFilter}
            />
          </div>
        )}
      </div>

      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "var(--space-4) var(--space-5)",
        }}
      >
        <p
          style={{
            color: "var(--ink-500)",
            fontSize: "var(--text-sm)",
            margin: "var(--space-2) 0 var(--space-1)",
            textTransform: "uppercase",
            letterSpacing: "var(--tracking-caps)",
            fontWeight: 600,
          }}
        >
          {household
            ? `${household.memberIds.length} member${household.memberIds.length === 1 ? "" : "s"}`
            : ""}
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "var(--text-2xl)",
            letterSpacing: "var(--tracking-tight)",
            margin: "0 0 var(--space-4)",
          }}
        >
          {household?.name ?? "Your household"}
        </h1>

        {/* ---------- Plan mode ---------- */}
        {mode === "plan" && (
          isEmpty ? (
            <EmptyState icon="list-checks" title="Your list is empty.">
              Add items as you think of them, or import a meal plan from
              RecipeTracker.
            </EmptyState>
          ) : grouping === "aisle" ? (
            <ListByAisle
              groups={aisleGroupsPlan}
              collapsed={collapsedAisles}
              onToggleCollapse={toggleCollapsedAisle}
              showCategory={false}
              onItemToggle={handleToggle}
              renderTrailing={(it) => (
                <div style={{ display: "flex" }}>
                  <IconButton
                    icon="pencil"
                    size={18}
                    aria-label={`Edit ${it.text}`}
                    onClick={() => {
                      setSheetError(null);
                      setEditing(it);
                    }}
                  />
                  <IconButton
                    icon="trash"
                    size={18}
                    variant="danger"
                    aria-label={`Remove ${it.text}`}
                    onClick={() => handleRowDelete(it)}
                  />
                </div>
              )}
            />
          ) : (
            <ListByStore
              groups={storeGroupsPlan}
              collapsed={collapsedStores}
              onToggleCollapse={toggleCollapsedStore}
              onItemToggle={handleToggle}
              renderTrailing={(it) => (
                <div style={{ display: "flex" }}>
                  <IconButton
                    icon="pencil"
                    size={18}
                    aria-label={`Edit ${it.text}`}
                    onClick={() => {
                      setSheetError(null);
                      setEditing(it);
                    }}
                  />
                  <IconButton
                    icon="trash"
                    size={18}
                    variant="danger"
                    aria-label={`Remove ${it.text}`}
                    onClick={() => handleRowDelete(it)}
                  />
                </div>
              )}
            />
          )
        )}

        {/* ---------- Shop mode ---------- */}
        {mode === "shop" && (
          isEmpty ? (
            <EmptyState icon="shopping-cart" title="Nothing on the list yet.">
              Switch to Plan to add items, then come back here to shop.
            </EmptyState>
          ) : shopIsEmpty ? (
            <EmptyState
              icon="store"
              title={
                storeFilter === "all"
                  ? "Nothing to shop right now."
                  : `Nothing at ${storeFilter}.`
              }
            >
              {storeFilter === "all"
                ? "Switch to Plan to add items."
                : "Pick a different store or switch to All stores."}
            </EmptyState>
          ) : allCheckedInFilteredView ? (
            <EmptyState icon="check" title="All checked off! Nice work.">
              Tap <strong>End trip</strong> to clear them from the list.
            </EmptyState>
          ) : (
            <ListByAisle
              groups={aisleGroupsShop}
              collapsed={collapsedAisles}
              onToggleCollapse={toggleCollapsedAisle}
              showCategory={false}
              onItemToggle={handleToggle}
              renderTrailing={null}
            />
          )
        )}
      </main>

      {/* ---------- Sticky bottom ---------- */}
      {mode === "plan" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--paper-100)",
            borderTop: "1px solid var(--border-faint)",
            padding:
              "var(--space-3) var(--space-5) calc(var(--space-3) + env(safe-area-inset-bottom))",
            display: "flex",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            {suggestions.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  overflowX: "auto",
                }}
              >
                {suggestions.map((s) => (
                  <SuggestionChip
                    key={s.id}
                    suggestion={s}
                    onPick={() => handleQuickAdd(s)}
                  />
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Input
                placeholder="Add an item…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickAdd();
                  }
                }}
                aria-label="New item text"
              />
              <Button
                icon="plus"
                onClick={() => handleQuickAdd()}
                disabled={!draft.trim() || !household || !user}
                aria-label="Add item"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}

      {mode === "shop" && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "var(--paper-100)",
            borderTop: "1px solid var(--border-faint)",
            padding:
              "var(--space-3) var(--space-5) calc(var(--space-3) + env(safe-area-inset-bottom))",
            display: "flex",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-sm)",
                color: "var(--ink-500)",
              }}
            >
              {householdCheckedCount} checked
            </span>
            <span style={{ flex: 1 }} />
            <Button
              variant="success"
              icon={endingTrip ? undefined : "check"}
              onClick={handleEndTrip}
              disabled={endingTrip || householdCheckedCount === 0}
            >
              {endingTrip ? "Ending…" : "End trip"}
            </Button>
          </div>
        </div>
      )}

      <EditItemSheet
        open={editing != null}
        title="Edit item"
        initial={
          editing
            ? {
                text: editing.text,
                quantity: editing.quantity,
                category: editing.category as GroceryCategory,
                stores: editing.stores,
              }
            : { text: "", quantity: 1, category: "misc", stores: [] }
        }
        availableStores={stores}
        saving={sheetSaving}
        error={sheetError}
        onClose={() => setEditing(null)}
        onSave={handleSheetSave}
        onDelete={handleSheetDelete}
      />

      <Toast visible={toast != null}>{toast ?? ""}</Toast>
    </div>
  );
}

// ---------- Section renderers ----------

type RenderableItem = ItemWithId & { addedAtMillis: number };

function ListByAisle({
  groups,
  collapsed,
  onToggleCollapse,
  showCategory,
  onItemToggle,
  renderTrailing,
}: {
  groups: { category: GroceryCategory; items: RenderableItem[] }[];
  collapsed: Set<string>;
  onToggleCollapse: (slug: string) => void;
  showCategory: boolean;
  onItemToggle: (item: ItemWithId) => void;
  renderTrailing: ((item: RenderableItem) => React.ReactNode) | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
      }}
    >
      {groups.map((g) => {
        const open = !collapsed.has(g.category);
        return (
          <CollapsibleSection
            key={g.category}
            open={open}
            onToggle={() => onToggleCollapse(g.category)}
            toggleLabel={`${open ? "Collapse" : "Expand"} ${categoryLabel(g.category)}`}
            header={<AisleHeader category={g.category} count={g.items.length} />}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {g.items.map((it) => (
                <GroceryItemRow
                  key={it.id}
                  text={it.text}
                  quantity={it.quantity}
                  stores={it.stores}
                  category={it.category as GroceryCategory}
                  showCategory={showCategory}
                  checked={it.checked}
                  onToggle={() => onItemToggle(it)}
                  trailing={renderTrailing ? renderTrailing(it) : undefined}
                />
              ))}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

function ListByStore({
  groups,
  collapsed,
  onToggleCollapse,
  onItemToggle,
  renderTrailing,
}: {
  groups: { store: string; items: RenderableItem[] }[];
  collapsed: Set<string>;
  onToggleCollapse: (store: string) => void;
  onItemToggle: (item: ItemWithId) => void;
  renderTrailing: ((item: RenderableItem) => React.ReactNode) | null;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
      }}
    >
      {groups.map((g) => {
        const open = !collapsed.has(g.store);
        const label = g.store || UNASSIGNED_LABEL;
        return (
          <CollapsibleSection
            key={g.store || "_unassigned"}
            open={open}
            onToggle={() => onToggleCollapse(g.store)}
            toggleLabel={`${open ? "Collapse" : "Expand"} ${label}`}
            header={<StoreHeader store={g.store} count={g.items.length} />}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {g.items.map((it) => (
                <GroceryItemRow
                  key={`${g.store}:${it.id}`}
                  text={it.text}
                  quantity={it.quantity}
                  stores={it.stores}
                  category={it.category as GroceryCategory}
                  showCategory
                  checked={it.checked}
                  onToggle={() => onItemToggle(it)}
                  trailing={renderTrailing ? renderTrailing(it) : undefined}
                />
              ))}
            </div>
          </CollapsibleSection>
        );
      })}
    </div>
  );
}

function StoreHeader({ store, count }: { store: string; count: number }) {
  const label = store || UNASSIGNED_LABEL;
  return (
    <div className="gr-aisle">
      <span style={{ color: "var(--ink-500)", display: "inline-flex" }}>
        <Icon name={store ? "store" : "filter"} size={18} />
      </span>
      <span className="gr-aisle__name">{label}</span>
      <span className="gr-aisle__count">{count}</span>
    </div>
  );
}

function SuggestionChip({
  suggestion,
  onPick,
}: {
  suggestion: CatalogEntryWithId;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={`Add ${suggestion.text} from memory`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-2)",
        flex: "0 0 auto",
        background: "var(--bg-card)",
        border: "1px solid var(--border-faint)",
        borderRadius: "var(--radius-pill)",
        padding: "var(--space-2) var(--space-3)",
        cursor: "pointer",
        font: "inherit",
        color: "var(--ink-900)",
        minHeight: "var(--tap-target)",
      }}
    >
      <Icon name="plus" size={14} />
      <span style={{ fontSize: "var(--text-sm)" }}>{suggestion.text}</span>
      <CategoryTag category={suggestion.defaultCategory} dot={false} />
      {suggestion.defaultQuantity > 1 && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--ink-500)",
          }}
        >
          ×{suggestion.defaultQuantity}
        </span>
      )}
    </button>
  );
}

function GroupingToggle({
  value,
  onChange,
}: {
  value: Grouping;
  onChange: (g: Grouping) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Grouping"
      style={{
        display: "inline-flex",
        border: "1px solid var(--border-faint)",
        borderRadius: "var(--radius-pill)",
        padding: 2,
        background: "var(--bg-card)",
      }}
    >
      {(["aisle", "store"] as const).map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              padding: "0 var(--space-3)",
              borderRadius: "var(--radius-pill)",
              border: "none",
              background: active ? "var(--paper-300)" : "transparent",
              color: active ? "var(--ink-900)" : "var(--ink-500)",
              cursor: "pointer",
              minHeight: "var(--tap-target)",
            }}
          >
            {opt === "aisle" ? "Aisle" : "Store"}
          </button>
        );
      })}
    </div>
  );
}
