One row on the grocery list — big checkoff, item text, count badge, and store meta line. The heart of both planning and shopping modes.

```jsx
<GroceryItemRow text="Lemons" stores={["Trader Joe's", "Costco"]}
  checked={false} onToggle={() => toggle(id)} />

<GroceryItemRow text="Yellow onions (3 medium)" quantity={3}
  category="vegetables" stores={["QFC"]} checked
  onToggle={() => toggle(id)} />

{/* plan mode: trailing edit button */}
<GroceryItemRow text="Whole milk" stores={["Costco"]}
  trailing={<IconButton icon="pencil" aria-label="Edit" />} />
```

Stateless — the parent owns `checked`. When checked, text strikes through in olive and the row tints. Set `showCategory` in store-grouped views (the chip is otherwise redundant under an aisle header). The `×N` count badge only appears when `quantity > 1`.
