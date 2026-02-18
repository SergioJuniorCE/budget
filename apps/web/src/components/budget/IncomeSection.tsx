import type { Id } from "@budget/backend/convex/_generated/dataModel";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddIncomeDialog } from "./AddEntryDialog";
import { SortableEntryRow } from "./SortableEntryRow";
import { formatCurrency, type IncomeEntry } from "./types";

function sortedEntries(entries: IncomeEntry[]): IncomeEntry[] {
  return [...entries].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a._creationTime - b._creationTime;
  });
}

interface IncomeSectionProps {
  entries: IncomeEntry[];
  onAdd: (name: string, amount: number, note?: string) => void;
  onEdit: (id: Id<"incomeEntries">, name: string, amount: number, note?: string) => void;
  onDelete: (id: Id<"incomeEntries">) => void;
  onReorder: (ids: Id<"incomeEntries">[]) => void;
}

export function IncomeSection({ entries, onAdd, onEdit, onDelete, onReorder }: IncomeSectionProps) {
  const sorted = sortedEntries(entries);
  const total = sorted.reduce((s, e) => s + e.amount, 0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((e) => e._id === active.id);
    const newIndex = sorted.findIndex((e) => e._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sorted, oldIndex, newIndex);
    onReorder(reordered.map((e) => e._id));
  }

  const ids = sorted.map((e) => e._id);

  return (
    <Card size="sm">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <span>Income</span>
          <AddIncomeDialog onAdd={onAdd} />
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        {sorted.length === 0 && (
          <p className="text-xs text-muted-foreground italic py-2">No income entries yet</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5">
              {sorted.map((entry) => (
                <SortableEntryRow
                  key={entry._id}
                  id={entry._id}
                  name={entry.name}
                  amount={entry.amount}
                  note={entry.note}
                  onEdit={(name, amount, note) => onEdit(entry._id, name, amount, note)}
                  onDelete={() => onDelete(entry._id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        {sorted.length > 0 && (
          <div className="mt-3 border-t pt-2 flex justify-between items-center">
            <span className="text-xs font-medium">Total Income</span>
            <span className="text-xs font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
