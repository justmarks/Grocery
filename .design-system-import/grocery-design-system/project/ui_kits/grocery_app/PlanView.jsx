// PlanView — write mode. The whole list grouped by aisle, each row with a
// remembered store/category meta line and an inline edit affordance. A
// sticky add-item composer sits at the bottom with autocomplete from memory.
const { useState, useMemo, useRef } = React;

function PlanView({ items, onAdd, onToggle, onRemove, memory }) {
  const {
    AisleHeader, GroceryItemRow, IconButton, Input, Button, CategoryTag,
  } = window.GroceryDesignSystem_df55be;
  const { groupByAisle } = window.GroceryData;

  const [draft, setDraft] = useState("");
  const groups = useMemo(() => groupByAisle(items), [items]);

  // Autocomplete suggestion from pantry memory.
  const suggestion = useMemo(() => {
    const q = draft.trim().toLowerCase();
    if (!q) return null;
    return memory.find((m) => m.text.toLowerCase().startsWith(q)) || null;
  }, [draft, memory]);

  function commit() {
    const text = draft.trim();
    if (!text) return;
    const remembered = memory.find(
      (m) => m.text.toLowerCase() === text.toLowerCase(),
    );
    onAdd({
      text,
      qty: 1,
      category: remembered?.category ?? "misc",
      stores: remembered?.stores ?? [],
    });
    setDraft("");
  }

  return (
    <div className="gk-plan">
      <div className="gk-scroll">
        {groups.map((g) => (
          <section className="gk-aisle-group" key={g.category}>
            <AisleHeader category={g.category} count={g.items.length} />
            {g.items.map((it) => (
              <GroceryItemRow
                key={it.id}
                text={it.text}
                quantity={it.qty}
                stores={it.stores}
                checked={it.checked}
                onToggle={() => onToggle(it.id)}
                trailing={
                  <div style={{ display: "flex" }}>
                    <IconButton icon="pencil" size={18} aria-label={`Edit ${it.text}`} />
                    <IconButton
                      icon="trash"
                      size={18}
                      variant="danger"
                      aria-label={`Remove ${it.text}`}
                      onClick={() => onRemove(it.id)}
                    />
                  </div>
                }
              />
            ))}
          </section>
        ))}
        <div style={{ height: 12 }} />
      </div>

      <div className="gk-composer">
        {suggestion && suggestion.text.toLowerCase() !== draft.trim().toLowerCase() && (
          <button
            type="button"
            className="gk-suggest"
            onClick={() => setDraft(suggestion.text)}
          >
            <span className="gk-suggest__text">
              {suggestion.text}
            </span>
            <CategoryTag category={suggestion.category} />
            <span className="count" style={{ marginLeft: "auto" }}>
              {suggestion.stores.join(" · ")}
            </span>
          </button>
        )}
        <div className="gk-composer__row">
          <Input
            placeholder="Add an item…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commit()}
          />
          <Button icon="plus" onClick={commit} aria-label="Add item" />
        </div>
      </div>
    </div>
  );
}

window.PlanView = PlanView;
