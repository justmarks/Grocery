The serif header above each aisle section — color dot, aisle name, optional count.

```jsx
<AisleHeader category="vegetables" count={4} />
<AisleHeader category="freezer" count={2} />   {/* shows the snowflake */}
```

Items always sort into these sections in canonical store-walk order. The freezer aisle gets a snowflake instead of a dot. Pair with a stack of `GroceryItemRow`s below it.
