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
  const total = sorted.reduce((sum, entry) => sum + entry.amount, 0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sorted.findIndex((entry) => entry._id === active.id);
    const newIndex = sorted.findIndex((entry) => entry._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(sorted, oldIndex, newIndex);
    onReorder(reordered.map((entry) => entry._id));
  }

  const ids = sorted.map((entry) => entry._id);

  return (
    <section
      aria-labelledby="income-ledger-title"
      className="overflow-hidden rounded-lg border border-border bg-card"
    >
      <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border bg-muted/45 px-3">
        <div>
          <h2 id="income-ledger-title" className="text-xs font-semibold">
            Income ledger
          </h2>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            Paste name and amount from Excel
          </p>
        </div>
        <AddIncomeDialog onAdd={onAdd} />
      </div>

      <div role="grid" aria-label="Monthly income sources" className="min-w-0">
        <div
          role="row"
          className="grid h-8 grid-cols-[1.75rem_1.75rem_minmax(9rem,1fr)_7.5rem] border-b border-border bg-muted/25 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
        >
          <div
            role="columnheader"
            aria-label="Reorder rows"
            className="grid place-items-center border-r border-border/70"
          >
            #
          </div>
          <div
            role="columnheader"
            aria-label="Payment status not applicable"
            className="border-r border-border/70"
          />
          <div role="columnheader" className="flex items-center px-2.5">
            Source
          </div>
          <div
            role="columnheader"
            className="flex items-center justify-end border-l border-border/70 px-2.5"
          >
            Monthly amount
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="grid min-h-36 place-items-center px-5 text-center">
            <div>
              <p className="text-xs font-semibold">Start with your income</p>
              <p className="mt-1 max-w-52 text-xs leading-relaxed text-muted-foreground">
                Add a source or paste two Excel cells into the form.
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div role="rowgroup">
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
        )}

        <div
          role="row"
          className="grid min-h-10 grid-cols-[3.5rem_minmax(9rem,1fr)_7.5rem] border-t border-border bg-muted/35 text-xs font-semibold"
        >
          <div role="gridcell" aria-label="Row controls" className="border-r border-border/70" />
          <div role="gridcell" className="flex items-center px-2.5">
            Total income
          </div>
          <div
            role="gridcell"
            className="flex items-center justify-end border-l border-border/70 px-2.5 font-mono tabular-nums"
          >
            {formatCurrency(total)}
          </div>
        </div>
      </div>
    </section>
  );
}
