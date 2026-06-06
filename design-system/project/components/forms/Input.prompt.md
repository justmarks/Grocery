Standard text input — white on cream paper, tomato focus halo.

```jsx
<Input placeholder="Add an item…" value={text} onChange={e => setText(e.target.value)} />
<Field label="Item"><Input placeholder="Lemons" /></Field>
```

Wrap in `<Field label="…">` for the labelled/hinted pattern. Accepts all native input props.
