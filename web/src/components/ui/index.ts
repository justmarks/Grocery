// Barrel for the ported design system primitives. Import from
// "@/components/ui" — keeps page code out of the deep folder paths.

export { Avatar } from "./core/Avatar";
export type { AvatarProps } from "./core/Avatar";

export { Brand, Monogram } from "./core/Brand";
export type { BrandProps, MonogramProps } from "./core/Brand";

export { Button } from "./core/Button";
export type { ButtonProps } from "./core/Button";

export { Icon, ICON_NAMES } from "./core/Icon";
export type { IconName, IconProps } from "./core/Icon";

export { IconButton } from "./core/IconButton";
export type { IconButtonProps } from "./core/IconButton";

export { Checkbox } from "./forms/Checkbox";
export type { CheckboxProps } from "./forms/Checkbox";

export { Field } from "./forms/Field";
export type { FieldProps } from "./forms/Field";

export { Input } from "./forms/Input";
export type { InputProps } from "./forms/Input";

export { Select } from "./forms/Select";
export type { SelectProps } from "./forms/Select";

export { AisleHeader } from "./grocery/AisleHeader";
export type { AisleHeaderProps } from "./grocery/AisleHeader";

export { CategoryTag } from "./grocery/CategoryTag";
export type { CategoryTagProps } from "./grocery/CategoryTag";

export { GroceryItemRow } from "./grocery/GroceryItemRow";
export type { GroceryItemRowProps } from "./grocery/GroceryItemRow";

export { ModeToggle } from "./grocery/ModeToggle";
export type { Mode, ModeToggleProps } from "./grocery/ModeToggle";

export { StoreFilter } from "./grocery/StoreFilter";
export type { StoreFilterProps } from "./grocery/StoreFilter";

export { EmptyState } from "./feedback/EmptyState";
export type { EmptyStateProps } from "./feedback/EmptyState";

export { Toast } from "./feedback/Toast";
export type { ToastProps } from "./feedback/Toast";

export {
  CATEGORIES,
  CATEGORY_BY_SLUG,
  categoryColors,
  categoryLabel,
} from "./grocery/categories";
