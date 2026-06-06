import { describe, it, expect } from "vitest";
import { groupByStore } from "../itemsCore";
import { DEFAULT_CATEGORY_ORDER } from "../household";
import type { GroceryCategory } from "../groceryList";

type TestItem = {
  id: string;
  category: GroceryCategory;
  checked: boolean;
  addedAtMillis: number;
  stores: string[];
};

function item(
  id: string,
  category: GroceryCategory,
  stores: string[],
  opts: Partial<TestItem> = {},
): TestItem {
  return {
    id,
    category,
    stores,
    checked: opts.checked ?? false,
    addedAtMillis: opts.addedAtMillis ?? 0,
  };
}

const STORES = ["Trader Joe's", "Costco", "Target", "QFC"];

describe("groupByStore", () => {
  it("emits store groups in the household stores order, skipping empty", () => {
    const items = [
      item("a", "fruits", ["Costco"]),
      item("b", "dairy", ["QFC"]),
      item("c", "meats", ["Costco"]),
    ];
    const groups = groupByStore(items, STORES, DEFAULT_CATEGORY_ORDER);
    expect(groups.map((g) => g.store)).toEqual(["Costco", "QFC"]);
  });

  it("duplicates items across each of their stores", () => {
    const items = [
      item("lemons", "fruits", ["Trader Joe's", "Costco"]),
      item("milk", "dairy", ["Costco"]),
    ];
    const groups = groupByStore(items, STORES, DEFAULT_CATEGORY_ORDER);
    const tj = groups.find((g) => g.store === "Trader Joe's");
    const co = groups.find((g) => g.store === "Costco");
    expect(tj?.items.map((i) => i.id)).toEqual(["lemons"]);
    expect(co?.items.map((i) => i.id).sort()).toEqual(["lemons", "milk"]);
  });

  it("sub-sorts within a store group by categoryOrder, then addedAt", () => {
    const items = [
      item("flour", "baking-and-dry-goods", ["Costco"], { addedAtMillis: 1 }),
      item("apples", "fruits", ["Costco"], { addedAtMillis: 2 }),
      item("yogurt", "dairy", ["Costco"], { addedAtMillis: 3 }),
      item("pears", "fruits", ["Costco"], { addedAtMillis: 4 }),
    ];
    const [group] = groupByStore(items, STORES, DEFAULT_CATEGORY_ORDER);
    expect(group.items.map((i) => i.id)).toEqual([
      "apples",
      "pears",
      "yogurt",
      "flour",
    ]);
  });

  it("floats checked items to the bottom of each store group", () => {
    const items = [
      item("a", "fruits", ["Costco"], { addedAtMillis: 1, checked: true }),
      item("b", "fruits", ["Costco"], { addedAtMillis: 2 }),
    ];
    const [group] = groupByStore(items, STORES, DEFAULT_CATEGORY_ORDER);
    expect(group.items.map((i) => i.id)).toEqual(["b", "a"]);
  });

  it("bucketing items with no stores into a trailing unassigned group", () => {
    const items = [
      item("lemons", "fruits", ["Costco"]),
      item("orphan", "misc", []),
    ];
    const groups = groupByStore(items, STORES, DEFAULT_CATEGORY_ORDER);
    expect(groups.at(-1)).toMatchObject({ store: "", items: [{ id: "orphan" }] });
  });

  it("appends orphan stores (referenced but not in stores[]) after known stores", () => {
    const items = [
      item("a", "fruits", ["Costco"]),
      item("b", "meats", ["FoodFanatic"]),
    ];
    const groups = groupByStore(items, ["Costco"], DEFAULT_CATEGORY_ORDER);
    expect(groups.map((g) => g.store)).toEqual(["Costco", "FoodFanatic"]);
  });
});
