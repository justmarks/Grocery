A borderless square icon button for row and top-bar actions. 44px tap target, paper hover wash.

```jsx
<IconButton icon="pencil" aria-label="Edit item" onClick={edit} />
<IconButton icon="trash" variant="danger" aria-label="Delete" onClick={remove} />
```

Always pass an `aria-label` — there's no visible text. `variant="danger"` tints the hover tomato for destructive actions.
