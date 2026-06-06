// ShopView — read mode. Items regrouped under the selected store, big
// checkoffs, a sticky store filter, and a live "got it" progress count.
// Within a store the items stay in aisle order so the shopper walks the
// aisles in sequence.
const { useState, useMemo } = React;

function ShopView({ items, store, onStore, onToggle, stores, onEndTrip }) {
  const { StoreFilter, AisleHeader, GroceryItemRow, Button, EmptyState } =
    window.GroceryDesignSystem_df55be;
  const { groupByAisle } = window.GroceryData;

  const visible = useMemo(
    () => (store === "all" ? items : items.filter((it) => it.stores.includes(store))),
    [items, store],
  );
  const groups = useMemo(() => groupByAisle(visible), [visible]);
  const remaining = visible.filter((it) => !it.checked).length;
  const total = visible.length;
  const allDone = total > 0 && remaining === 0;

  return (
    <div className="gk-shop">
      <div className="gk-shop__filter">
        <StoreFilter stores={stores} value={store} onChange={onStore} />
      </div>

      <div className="gk-progress">
        <span className="eyebrow">
          {store === "all" ? "All stores" : store}
        </span>
        <span className="count">
          {total - remaining}/{total} in the cart
        </span>
      </div>

      <div className="gk-scroll">
        {allDone ? (
          <EmptyState
            icon="check"
            title="All checked off!"
            action={<Button variant="success" icon="check" onClick={onEndTrip}>End trip</Button>}
          >
            Nice work. End the trip to clear what you bought for next time.
          </EmptyState>
        ) : (
          groups.map((g) => (
            <section className="gk-aisle-group" key={g.category}>
              <AisleHeader category={g.category} count={g.items.length} />
              {g.items.map((it) => (
                <GroceryItemRow
                  key={it.id}
                  text={it.text}
                  quantity={it.qty}
                  stores={store === "all" ? it.stores : []}
                  checked={it.checked}
                  onToggle={() => onToggle(it.id)}
                />
              ))}
            </section>
          ))
        )}
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

window.ShopView = ShopView;
