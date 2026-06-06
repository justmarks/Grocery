An outline-only stroke icon (Lucide-style, 1.5px, currentColor) — the single icon source for the Grocery system.

```jsx
<Icon name="shopping-cart" size={20} />
<button className="..."><Icon name="check" size={18} /></button>
<span style={{ color: "var(--cat-freezer-fg)" }}><Icon name="snowflake" /></span>
```

Color comes from `currentColor`, so set it on the icon (or a parent) via `style`/`className`. `size` sets both width and height. `filled` swaps to a solid fill for stateful glyphs. Grocery-specific names beyond the shared set: `shopping-cart`, `store`, `snowflake` (freezer), `minus` (quantity), `filter`.
