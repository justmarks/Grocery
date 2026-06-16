// Home — a single list view (the old "shop" layout): unchecked
// items grouped by aisle (store-walk order), a collapsible Checked
// section for review, and an End-trip bar. Adding happens through a
// drawer that drops from the sticky top (the "Add item" button);
// every row carries edit/delete so there's no separate planning
// mode. The drawer is toggled by a floating action button pinned
// above the End-trip bar.
//
// The sticky top region (header + store filter) scrolls as one
// block so the controls stay reachable while a long list scrolls
// underneath.
//
// State that survives reloads (in localStorage):
//   grocery.shop.store — "all" | <store name> (store filter)

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { trackEvent } from "../lib/analytics";
import {
  findCatalogSuggestions,
  findExactCatalogMatch,
  groupByAisle,
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
  StoreFilter,
  Toast,
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

const STORE_FILTER_KEY = "grocery.shop.store";
const EMPTY_STORES: string[] = [];

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

  const [storeFilter, setStoreFilter] = useState<string>(readStoreFilter);
  // Top add-drawer — closed by default; the list is the main event.
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<ItemWithId | null>(null);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [sheetSaving, setSheetSaving] = useState(false);
  const [endingTrip, setEndingTrip] = useState(false);

  const [collapsedAisles, setCollapsedAisles] = useState<Set<string>>(
    () => new Set(),
  );
  // Shop-mode "Checked" review section — collapsed by default so the
  // focus stays on what's left to get; the header count signals
  // there's something to review.
  const [checkedOpen, setCheckedOpen] = useState(false);

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

  // Apply the store filter before grouping so the section counts
  // only reflect what the user can actually see right now.
  const shopVisibleItems = useMemo(() => {
    if (storeFilter === "all") return groupableItems;
    return groupableItems.filter((it) => it.stores.includes(storeFilter));
  }, [groupableItems, storeFilter]);

  // The list separates "still to get" from "already in the cart".
  // Unchecked items group by aisle at the top; checked items collect
  // in a single collapsible "Checked" section at the bottom so the
  // shopper can review everything they ticked off (and undo a
  // mis-tap) before ending the trip.
  const shopUnchecked = useMemo(
    () => shopVisibleItems.filter((it) => !it.checked),
    [shopVisibleItems],
  );
  const shopChecked = useMemo(
    () => shopVisibleItems.filter((it) => it.checked),
    [shopVisibleItems],
  );
  const aisleGroupsShop = useMemo(
    () => groupByAisle(shopUnchecked, categoryOrder),
    [shopUnchecked, categoryOrder],
  );

  // End-trip is enabled whenever anything across the household is
  // checked (not just what's visible under the current filter).
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
        stores: remembered?.defaultStores ?? (storeFilter !== "all" ? [storeFilter] : undefined),
        quantity: remembered?.defaultQuantity,
      });
      trackEvent("item_added");
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
      trackEvent("item_checked");
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
      trackEvent("item_updated");
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
      trackEvent("item_deleted");
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
      trackEvent("item_deleted");
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
  const allChecked = shopUnchecked.length === 0 && shopChecked.length > 0;

  const rowTrailing = (it: RenderableItem) => (
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
  );

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--paper-100)",
        color: "var(--ink-900)",
        fontFamily: "var(--font-sans)",
        // Reserve room for the sticky bottom bar.
        paddingBottom:
          "calc(var(--space-20) + var(--space-4) + env(safe-area-inset-bottom))",
      }}
    >
      {/* Sticky top assembly — header + store filter, plus the
          add-item drawer that drops from beneath them (FAB-toggled). */}
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

        {stores.length > 0 && (
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "0 var(--space-5) var(--space-3)",
            }}
          >
            <StoreFilter
              stores={stores}
              logos={household?.storeLogos}
              value={storeFilter}
              onChange={setStoreFilter}
            />
          </div>
        )}

        {addOpen && (
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "0 var(--space-5) var(--space-4)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-2)",
            }}
          >
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <Input
                autoFocus
                placeholder="Add an item…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleQuickAdd();
                  }
                  if (e.key === "Escape") setAddOpen(false);
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
        {isEmpty ? (
          <EmptyState icon="shopping-cart" title="Nothing on the list yet.">
            Tap <strong>Add item</strong> above, or import a meal plan from
            RecipeTracker.
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
              ? "Tap Add item above to get started."
              : "Pick a different store or switch to All stores."}
          </EmptyState>
        ) : (
          <>
            {allChecked ? (
              <EmptyState icon="check" title="All checked off! Nice work.">
                Review what you got below, or tap <strong>End trip</strong> to
                clear the list.
              </EmptyState>
            ) : (
              <ListByAisle
                groups={aisleGroupsShop}
                collapsed={collapsedAisles}
                onToggleCollapse={toggleCollapsedAisle}
                onItemToggle={handleToggle}
                renderTrailing={rowTrailing}
              />
            )}

            {shopChecked.length > 0 && (
              <CheckedSection
                items={shopChecked}
                // Auto-expand when there's nothing left to get, so the
                // review is immediate; otherwise the shopper opts in.
                open={checkedOpen || allChecked}
                onToggleOpen={() => setCheckedOpen((o) => !o)}
                onUncheck={handleToggle}
                renderTrailing={rowTrailing}
              />
            )}
          </>
        )}
      </main>

      {/* FAB — toggles the add-item drawer at the top. Inherits the
          primary button's hover/active/focus states; sized as a 56px
          disc and pinned above the End-trip bar, right-aligned to
          the 560px content column. */}
      <button
        type="button"
        className="gr-btn gr-btn--primary"
        aria-label={addOpen ? "Close add item" : "Add item"}
        aria-expanded={addOpen}
        onClick={() => setAddOpen((o) => !o)}
        style={{
          position: "fixed",
          // 560px column ⇒ its right edge sits at 50vw - 280px.
          right: "max(var(--space-5), calc(50vw - 280px + var(--space-5)))",
          bottom: "calc(var(--space-20) + env(safe-area-inset-bottom))",
          zIndex: 30,
          width: 56,
          height: 56,
          minHeight: 56,
          padding: 0,
          borderRadius: "var(--radius-pill)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <Icon name={addOpen ? "x" : "plus"} size={24} />
      </button>

      {/* ---------- Sticky bottom ---------- */}
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
        <div style={{ width: "100%", maxWidth: 560, display: "flex" }}>
          <Button
            variant="success"
            icon={endingTrip ? undefined : "check"}
            onClick={handleEndTrip}
            disabled={endingTrip || householdCheckedCount === 0}
            style={{ flex: 1 }}
          >
            {endingTrip ? "Ending…" : "End trip"}
          </Button>
        </div>
      </div>

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
        storeLogos={household?.storeLogos}
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

// ---------- Section renderer ----------

type RenderableItem = ItemWithId & { addedAtMillis: number };

function ListByAisle({
  groups,
  collapsed,
  onToggleCollapse,
  onItemToggle,
  renderTrailing,
}: {
  groups: { category: GroceryCategory; items: RenderableItem[] }[];
  collapsed: Set<string>;
  onToggleCollapse: (slug: string) => void;
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
                gap: "var(--space-1)",
              }}
            >
              {g.items.map((it) => (
                <GroceryItemRow
                  key={it.id}
                  text={it.text}
                  quantity={it.quantity}
                  stores={it.stores}
                  category={it.category as GroceryCategory}
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

function CheckedSection({
  items,
  open,
  onToggleOpen,
  onUncheck,
  renderTrailing,
}: {
  items: RenderableItem[];
  open: boolean;
  onToggleOpen: () => void;
  onUncheck: (item: ItemWithId) => void;
  renderTrailing?: (item: RenderableItem) => React.ReactNode;
}) {
  return (
    <div style={{ marginTop: "var(--space-8)" }}>
      <CollapsibleSection
        open={open}
        onToggle={onToggleOpen}
        toggleLabel={`${open ? "Hide" : "Show"} checked items`}
        header={
          <div className="gr-aisle">
            <span style={{ color: "var(--olive-700)", display: "inline-flex" }}>
              <Icon name="check" size={18} />
            </span>
            <span className="gr-aisle__name">Checked</span>
            <span className="gr-aisle__count">{items.length}</span>
          </div>
        }
      >
        <p
          style={{
            margin: "0 0 var(--space-2)",
            color: "var(--ink-500)",
            fontSize: "var(--text-sm)",
          }}
        >
          Tap a checkbox to put an item back on the list.
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          {items.map((it) => (
            <GroceryItemRow
              key={it.id}
              text={it.text}
              quantity={it.quantity}
              stores={it.stores}
              category={it.category as GroceryCategory}
              checked
              onToggle={() => onUncheck(it)}
              trailing={renderTrailing ? renderTrailing(it) : undefined}
            />
          ))}
        </div>
      </CollapsibleSection>
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
