Sticky single-store filter for shopping mode — "All stores" plus one pill per household store, exactly one active.

```jsx
<StoreFilter stores={["Trader Joe's", "Costco", "Target", "QFC"]}
  value={store} onChange={setStore} />
```

The active pill goes ink-dark. Persist `value` in local storage so reopening the app at the store keeps the filter. Scrolls horizontally when stores overflow.
