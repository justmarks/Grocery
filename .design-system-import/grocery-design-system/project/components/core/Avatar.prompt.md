Round household-member avatar — shows a photo, or initials on a deterministic warm-palette disc.

```jsx
<Avatar name="Justin Marks" />
<Avatar name="Sarah" src={photoUrl} size={40} />
```

The disc color is hashed from `name`, so each member keeps a stable color. Used in the member list and shared-list presence row.
