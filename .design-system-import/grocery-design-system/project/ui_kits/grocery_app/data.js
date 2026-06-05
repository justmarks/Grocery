// Fake household + list data for the Grocery UI kit. Shape mirrors the
// PLAN.md data model: one shared list, items tagged by category + stores,
// a remembered-items "pantry memory", and a RecipeTracker import payload.

const HOUSEHOLD = {
  name: "Marks Family",
  members: [
    { name: "Justin Marks", you: true },
    { name: "Sarah Park" },
    { name: "Theo Marks" },
    { name: "Mara Lee" },
  ],
  stores: ["Trader Joe's", "Costco", "QFC"],
};

// The shared list. `checked` is the shopping-mode bought state.
const ITEMS = [
  { id: "i1", text: "Lemons", qty: 1, category: "fruits", stores: ["Trader Joe's", "QFC"], checked: false },
  { id: "i2", text: "Bananas", qty: 6, category: "fruits", stores: ["Trader Joe's"], checked: false },
  { id: "i3", text: "Yellow onions", qty: 3, category: "vegetables", stores: ["QFC"], checked: false },
  { id: "i4", text: "Romaine hearts", qty: 1, category: "vegetables", stores: ["Trader Joe's", "Costco"], checked: true },
  { id: "i5", text: "Carrots", qty: 1, category: "vegetables", stores: ["Costco"], checked: false },
  { id: "i6", text: "Ground beef", qty: 2, category: "meats", stores: ["Costco"], checked: false },
  { id: "i7", text: "Chicken thighs", qty: 1, category: "meats", stores: ["Costco"], checked: false },
  { id: "i8", text: "Whole milk", qty: 2, category: "dairy", stores: ["Costco", "QFC"], checked: false },
  { id: "i9", text: "Greek yogurt", qty: 1, category: "dairy", stores: ["Trader Joe's"], checked: true },
  { id: "i10", text: "Sharp cheddar", qty: 1, category: "cheeses", stores: ["Trader Joe's"], checked: false },
  { id: "i11", text: "All-purpose flour", qty: 1, category: "baking-and-dry-goods", stores: ["Costco"], checked: false },
  { id: "i12", text: "Sourdough loaf", qty: 1, category: "bread-and-crackers", stores: ["Trader Joe's"], checked: false },
  { id: "i13", text: "Sparkling water", qty: 12, category: "beverages", stores: ["Costco"], checked: false },
  { id: "i14", text: "Paper towels", qty: 1, category: "paper-goods", stores: ["Costco"], checked: false },
  { id: "i15", text: "Frozen peas", qty: 2, category: "freezer", stores: ["Costco"], checked: false },
  { id: "i16", text: "Vanilla ice cream", qty: 1, category: "freezer", stores: ["QFC"], checked: false },
];

// "Remembers what you've bought" — typing autocompletes with the usual
// category + stores. A handful of remembered items for the add-item flow.
const MEMORY = [
  { text: "Eggs", category: "dairy", stores: ["Costco", "QFC"] },
  { text: "Avocados", category: "fruits", stores: ["Trader Joe's"] },
  { text: "Olive oil", category: "baking-and-dry-goods", stores: ["Costco"] },
  { text: "Tortillas", category: "bread-and-crackers", stores: ["Trader Joe's"] },
  { text: "Butter", category: "dairy", stores: ["Costco"] },
  { text: "Spinach", category: "vegetables", stores: ["Trader Joe's", "QFC"] },
];

// Canonical store-walk order for aisle grouping.
const CATEGORY_ORDER = [
  "fruits", "vegetables", "meats", "dairy", "cheeses",
  "baking-and-dry-goods", "bread-and-crackers", "beverages",
  "paper-goods", "freezer", "misc",
];

function groupByAisle(items) {
  const groups = {};
  for (const it of items) (groups[it.category] ??= []).push(it);
  return CATEGORY_ORDER
    .filter((c) => groups[c]?.length)
    .map((c) => ({ category: c, items: groups[c] }));
}

window.GroceryData = {
  HOUSEHOLD, ITEMS, MEMORY, CATEGORY_ORDER, groupByAisle,
};
