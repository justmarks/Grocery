// GroceryApp — the phone shell that ties the surfaces together: a top bar
// with the brand + household avatars, the Plan/Shop mode toggle, the active
// view, a bottom tab bar, and the toast. Holds the single shared list in
// state so checkoffs, adds, and removes all mutate one source.
const { useState, useCallback, useEffect } = React;

function GroceryApp({ initialItems }) {
  const { Brand, ModeToggle, Avatar, IconButton, Toast, Button } =
    window.GroceryDesignSystem_df55be;
  const { HOUSEHOLD, MEMORY } = window.GroceryData;

  const [items, setItems] = useState(initialItems);
  const [mode, setMode] = useState("plan");
  const [store, setStore] = useState("all");
  const [toast, setToast] = useState(null);

  const flash = useCallback((msg) => {
    setToast(msg);
    window.clearTimeout(flash._t);
    flash._t = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const toggle = useCallback((id) => {
    setItems((list) =>
      list.map((it) => (it.id === id ? { ...it, checked: !it.checked } : it)),
    );
  }, []);

  const add = useCallback((item) => {
    setItems((list) => [
      ...list,
      { ...item, id: "n" + Date.now() + Math.random().toString(36).slice(2, 5), checked: false },
    ]);
    flash(`Added ${item.text}`);
  }, [flash]);

  const remove = useCallback((id) => {
    setItems((list) => list.filter((it) => it.id !== id));
  }, []);

  const endTrip = useCallback(() => {
    setItems((list) => list.filter((it) => !it.checked));
    flash("Trip ended — checked items cleared");
    setMode("plan");
  }, [flash]);

  return (
    <div className="gk-app">
      <header className="gk-topbar">
        <Brand />
        <div className="gk-topbar__right">
          <div className="gk-avatars">
            {HOUSEHOLD.members.slice(0, 3).map((m) => (
              <Avatar key={m.name} name={m.name} size={28} />
            ))}
            <span className="gk-avatars__more">+1</span>
          </div>
          <IconButton icon="settings" aria-label="Settings" />
        </div>
      </header>

      <div className="gk-modebar">
        <ModeToggle value={mode} onChange={setMode} />
        <span className="gk-listmeta count">{items.length} items</span>
      </div>

      <main className="gk-main">
        {mode === "plan" ? (
          <window.PlanView
            items={items}
            memory={MEMORY}
            onAdd={add}
            onToggle={toggle}
            onRemove={remove}
          />
        ) : (
          <window.ShopView
            items={items}
            stores={HOUSEHOLD.stores}
            store={store}
            onStore={setStore}
            onToggle={toggle}
            onEndTrip={endTrip}
          />
        )}
      </main>

      <nav className="gk-tabbar">
        <button type="button" className="gk-tab is-active">
          <window.GroceryDesignSystem_df55be.Icon name="list-checks" size={22} />
          List
        </button>
        <button type="button" className="gk-tab">
          <window.GroceryDesignSystem_df55be.Icon name="store" size={22} />
          Stores
        </button>
        <button type="button" className="gk-tab">
          <window.GroceryDesignSystem_df55be.Icon name="users" size={22} />
          Household
        </button>
      </nav>

      <Toast visible={!!toast}>{toast}</Toast>
    </div>
  );
}

window.GroceryApp = GroceryApp;
