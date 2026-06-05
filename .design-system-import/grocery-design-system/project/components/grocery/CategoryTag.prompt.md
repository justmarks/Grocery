A flat color chip marking an item's aisle category. Each of the eleven categories has its own color so a shopper learns to scan for it.

```jsx
<CategoryTag category="vegetables" />        {/* olive "Vegetables" chip */}
<CategoryTag category="freezer" />           {/* frost "Freezer" chip */}
<CategoryTag category="meats" dot={false}>Beef</CategoryTag>
```

`category` resolves both the label and the color from the `--cat-*` tokens. The leading dot uses the mid swatch tone; hide it with `dot={false}`. Valid slugs: fruits, vegetables, meats, dairy, cheeses, baking-and-dry-goods, bread-and-crackers, beverages, paper-goods, freezer, misc.
