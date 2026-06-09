// Drag-to-reorder aisle list for Settings. Built on @dnd-kit so it
// gets touch, mouse, AND keyboard reordering for free (focus a grip,
// press Space to pick up, arrows to move, Space to drop) — that
// keyboard sensor is why we can drop the old up/down chevrons and
// still be accessible.
//
// Horizontal drift is locked (x zeroed in the transform) so rows
// only travel vertically — no extra @dnd-kit/modifiers dependency
// needed for a single-column list.

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { GroceryCategory } from "@grocery/shared";
import { AisleHeader, Icon } from "./ui";
import { categoryLabel } from "./ui/grocery/categories";

export type CategoryOrderListProps = {
  order: GroceryCategory[];
  onChange: (next: GroceryCategory[]) => void;
  disabled?: boolean;
};

export function CategoryOrderList({
  order,
  onChange,
  disabled = false,
}: CategoryOrderListProps) {
  const sensors = useSensors(
    // Small activation distance so a tap-scroll on the row isn't
    // mistaken for a drag; the grip handle still starts dragging.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id as GroceryCategory);
    const to = order.indexOf(over.id as GroceryCategory);
    if (from < 0 || to < 0) return;
    onChange(arrayMove(order, from, to));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          {order.map((slug) => (
            <SortableRow key={slug} slug={slug} disabled={disabled} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  slug,
  disabled,
}: {
  slug: GroceryCategory;
  disabled: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slug, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{
        // Lock horizontal travel: keep only the vertical component.
        transform: CSS.Transform.toString(
          transform ? { ...transform, x: 0, scaleX: 1, scaleY: 1 } : null,
        ),
        transition,
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-faint)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-1) var(--space-2)",
        boxShadow: isDragging ? "var(--shadow-md)" : undefined,
        opacity: isDragging ? 0.9 : 1,
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
      }}
    >
      <button
        type="button"
        className="gr-iconbtn"
        aria-label={`Reorder ${categoryLabel(slug)}`}
        disabled={disabled}
        style={{ cursor: disabled ? "default" : "grab", touchAction: "none" }}
        {...attributes}
        {...listeners}
      >
        <Icon name="grip-vertical" size={18} />
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <AisleHeader category={slug} />
      </div>
    </li>
  );
}
