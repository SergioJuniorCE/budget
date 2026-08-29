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
    <Card size="sm" className="h-full gap-0">
      <CardHeader className="border-b border-border/70">
        <CardTitle className="flex items-center justify-between gap-3">
          <span>Income sources</span>
          <AddIncomeDialog onAdd={onAdd} />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-3">
        {sorted.length === 0 && (
          <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border px-4 text-center">
            <div>
              <p className="text-xs font-semibold">Start with your income</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Add each monthly income source to calculate your plan.
              </p>
            </div>
          </div>
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
          <div className="mt-auto flex items-center justify-between rounded-lg bg-primary/8 px-3 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">Monthly income</span>
            <span className="text-sm font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
