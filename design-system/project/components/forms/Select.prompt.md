Standard select — matches Input's chrome, with a custom chevron-down.

```jsx
<Field label="Aisle">
  <Select value={cat} onChange={e => setCat(e.target.value)}>
    <option value="produce">Produce</option>
    <option value="meats">Meats</option>
  </Select>
</Field>
```

Accepts all native select props. Wrap in `<Field>` for a label.
