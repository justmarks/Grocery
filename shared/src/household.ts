// Household + Item + Catalog + Invite shapes for the Grocery app's own
// Firestore documents. The full data model lives in PLAN.md §
// "Data model (Firestore)"; this file is the source of truth that the
// security rules' isValid* helpers should track 1:1.

import { z } from "zod";
import { GROCERY_CATEGORIES, GroceryCategorySchema } from "./groceryList";

export const DEFAULT_STORES = [
  "Trader Joe's",
  "Costco",
  "Target",
  "QFC",
] as const;

/**
 * Seeded default for `households/{id}.categoryOrder`. Canonical
 * store-walk order — perishables first, freezer + misc last.
 * Single source of truth: copy of `GROCERY_CATEGORIES` (the array's
 * own declared order).
 */
export const DEFAULT_CATEGORY_ORDER = [...GROCERY_CATEGORIES] as const;

export const MemberRoleSchema = z.enum(["owner", "editor"]);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export const MemberSchema = z.object({
  role: MemberRoleSchema,
  joinedAt: z.unknown(), // Firestore Timestamp on read; serverTimestamp() on write
  displayName: z.string(),
});
export type Member = z.infer<typeof MemberSchema>;

export const UserDocSchema = z.object({
  displayName: z.string(),
  email: z.string().email(),
  photoURL: z.string().url().nullable().optional(),
  householdId: z.string().nullable(),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});
export type UserDoc = z.infer<typeof UserDocSchema>;

export const HouseholdSchema = z.object({
  name: z.string().min(1).max(120),
  ownerId: z.string().min(1),
  memberIds: z.array(z.string()),
  members: z.record(z.string(), MemberSchema),
  stores: z.array(z.string().min(1)).min(1),
  categoryOrder: z.array(GroceryCategorySchema),
  /**
   * Per-store logos, keyed by store name. Each value is a small
   * client-resized image data URL (~96px WebP/PNG, a few KB) — stored
   * inline rather than in Cloud Storage so it works offline and adds
   * no bucket dependency. Optional + back-compat: stores without an
   * entry fall back to a monogram disc. Keyed by name, so removing a
   * store should drop its entry; renaming isn't supported (stores are
   * add/remove only).
   */
  storeLogos: z.record(z.string(), z.string()).optional(),
  createdAt: z.unknown(),
  updatedAt: z.unknown(),
});
export type Household = z.infer<typeof HouseholdSchema>;

export const ItemSourceSchema = z.enum(["manual", "catalog", "mealplan"]);
export type ItemSource = z.infer<typeof ItemSourceSchema>;

export const ItemSourceRefSchema = z
  .object({
    mealPlanId: z.string().optional(),
    recipeIds: z.array(z.string()).optional(),
  })
  .nullable();
export type ItemSourceRef = z.infer<typeof ItemSourceRefSchema>;

export const ItemSchema = z.object({
  text: z.string().min(1).max(280),
  quantity: z.number().int().min(1).max(999),
  category: GroceryCategorySchema,
  stores: z.array(z.string().min(1)),
  checked: z.boolean(),
  checkedBy: z.string().nullable(),
  checkedAt: z.unknown().nullable(),
  addedBy: z.string().min(1),
  addedAt: z.unknown(),
  source: ItemSourceSchema,
  sourceRef: ItemSourceRefSchema.optional(),
});
export type Item = z.infer<typeof ItemSchema>;

export const CatalogEntrySchema = z.object({
  text: z.string().min(1).max(280),
  textLower: z.string().min(1).max(280),
  searchTokens: z.array(z.string()),
  defaultCategory: GroceryCategorySchema,
  defaultStores: z.array(z.string()),
  defaultQuantity: z.number().int().min(1).max(999),
  timesUsed: z.number().int().min(0),
  lastUsedAt: z.unknown(),
  /** User's preferred display unit for this ingredient (e.g. "sticks", "cups"). */
  preferredUnit: z.string().optional(),
});
export type CatalogEntry = z.infer<typeof CatalogEntrySchema>;

export const InviteStatusSchema = z.enum(["pending", "accepted", "revoked"]);
export type InviteStatus = z.infer<typeof InviteStatusSchema>;

export const InviteSchema = z.object({
  householdId: z.string().min(1),
  /** Denormalized for the invitee landing page — they're not a
   * household member yet, so they can't read the household doc. */
  householdName: z.string().min(1),
  invitedEmail: z.string().email(),
  invitedBy: z.string().min(1),
  /** Denormalized for the invitee landing page. */
  inviterName: z.string().min(1),
  status: InviteStatusSchema,
  createdAt: z.unknown(),
  expiresAt: z.unknown(),
});
export type Invite = z.infer<typeof InviteSchema>;
