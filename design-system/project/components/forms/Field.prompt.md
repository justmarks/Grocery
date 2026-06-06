Labelled form-field wrapper — bold label above, optional hint or error below. Wraps the control in a `<label>`.

```jsx
<Field label="Item" hint="What you'll see at the shelf">
  <Input placeholder="Lemons" />
</Field>
<Field label="Count" error="Must be at least 1">
  <Input type="number" value={0} />
</Field>
```

`error` overrides `hint` and renders in tomato.
