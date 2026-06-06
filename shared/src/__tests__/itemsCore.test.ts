import { describe, it, expect } from "vitest";
import {
  groupByAisle,
  formatStores,
  type GroupableItem,
} from "../itemsCore";
import { DEFAULT_CATEGORY_ORDER } from "../household";

function item(
  id: string,
  category: GroupableItem["category"],
  opts: Partial<GroupableItem> = {},
): GroupableItem {
  return {
    id,
    category,
    checked: opts.checked ?? false,
    addedAtMillis: opts.addedAtMillis ?? 0,
  };
}

describe("groupByAisle", () => {
  it("emits groups in categoryOrder order, skipping empty ones", () => {
    const items = [
      item("a", "fruits", { addedAtMillis: 1 }),
      item("b", "meats", { addedAtMillis: 2 }),
      item("c", "fruits", { addedAtMillis: 3 }),
    ];
    const groups = groupByAisle(items, DEFAULT_CATEGORY_ORDER);
    expect(groups.map((g) => g.category)).toEqual(["fruits", "meats"]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["a", "c"]);
    expect(groups[1].items.map((i) => i.id)).toEqual(["b"]);
  });

  it("sorts within a section by addedAt ascending", () => {
    const items = [
      item("late", "dairy", { addedAtMillis: 30 }),
      item("early", "dairy", { addedAtMillis: 10 }),
      item("mid", "dairy", { addedAtMillis: 20 }),
    ];
    const [group] = groupByAisle(items, ["dairy"]);
    expect(group.items.map((i) => i.id)).toEqual(["early", "mid", "late"]);
  });

  it("floats checked items to the bottom of a section by default", () => {
    const items = [
      item("a", "fruits", { addedAtMillis: 1, checked: true }),
      item("b", "fruits", { addedAtMillis: 2 }),
      item("c", "fruits", { addedAtMillis: 3, checked: true }),
      item("d", "fruits", { addedAtMillis: 4 }),
    ];
    const [group] = groupByAisle(items, ["fruits"]);
    expect(group.items.map((i) => i.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("respects checkedFloat: false", () => {
    const items = [
      item("a", "fruits", { addedAtMillis: 1, checked: true }),
      item("b", "fruits", { addedAtMillis: 2 }),
    ];
    const [group] = groupByAisle(items, ["fruits"], { checkedFloat: false });
    expect(group.items.map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("buckets unknown categories into misc when the order includes it", () => {
    // Use a typed cast so the test exercises the runtime fallback path.
    const orphan = item("o", "fruits", { addedAtMillis: 1 });
    orphan.category = "wildcard" as unknown as typeof orphan.category;
    const groups = groupByAisle([orphan, item("m", "misc")], DEFAULT_CATEGORY_ORDER);
    const miscGroup = groups.find((g) => g.category === "misc");
    expect(miscGroup?.items.map((i) => i.id)).toEqual(["m", "o"]);
  });

  it("returns an empty array for no items", () => {
    expect(groupByAisle([], DEFAULT_CATEGORY_ORDER)).toEqual([]);
  });
});

describe("formatStores", () => {
  it("joins with the design-guide separator", () => {
    expect(formatStores(["Trader Joe's", "Costco"])).toBe(
      "Trader Joe's · Costco",
    );
  });
  it("returns an empty string for no stores", () => {
    expect(formatStores([])).toBe("");
  });
});
