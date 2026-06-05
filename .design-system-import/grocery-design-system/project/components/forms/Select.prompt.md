Standard select — matches Input's chrome, with a custom chevron-down.

```jsx
<Field label="Aisle">
  <Select value={cat} onChange={e => setCat(e.target.value)}>
    <option value="fruits">Fruits</option>
    <option value="vegetables">Vegetables</option>
  </Select>
</Field>
```

Accepts all native select props. Wrap in `<Field>` for a label.
