The Plan / Shop segmented toggle at the top of the list. Plan = write mode (add/edit), Shop = read mode (checkoffs + store filter).

```jsx
<ModeToggle value={mode} onChange={setMode} />
```

The active "Shop" option tints olive to signal the "at the store" context. This is the single most important mode switch in the app — keep it prominent at the top.
