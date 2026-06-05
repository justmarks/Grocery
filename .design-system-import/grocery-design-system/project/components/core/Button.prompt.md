The primary action button — tomato fill, warm focus ring, 44px min tap target.

```jsx
<Button onClick={save}>Add item</Button>
<Button variant="secondary" icon="store">Stores</Button>
<Button variant="success" icon="check">End trip</Button>
<Button variant="ghost" size="sm" icon="plus">Add another</Button>
<Button variant="danger" icon="trash">Remove</Button>
```

Variants: `primary` (tomato, default), `secondary` (outlined), `ghost` (tomato text), `danger` (tomato-text destructive), `success` (olive — the "got it / end trip" green). Sizes `sm | md | lg`. Pass icons by name via `icon` / `iconRight`, never raw SVG children.
