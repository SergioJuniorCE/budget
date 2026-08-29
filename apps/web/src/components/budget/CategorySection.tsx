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

import { cn } from "@/lib/utils";
import { AddBudgetEntryDialog } from "./AddEntryDialog";
import { SortableEntryRow } from "./SortableEntryRow";
import {
  CATEGORY_LABELS,
  formatCurrency,
  type BudgetEntry,
  type Category,
  type Quincena,
} from "./types";

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "text-needs",
  wants: "text-wants",
  savings: "text-savings",
};

const CATEGORY_BORDER: Record<Category, string> = {
  needs: "border-l-needs",
  wants: "border-l-wants",
  savings: "border-l-savings",
};

const CATEGORY_RULES: Record<Category, string> = {
  needs: "50%",
  wants: "30%",
  savings: "20%",
};

function sortedEntries(entries: BudgetEntry[]): BudgetEntry[] {
  return [...entries].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return a._creationTime - b._creationTime;
  });
}

interface CategorySectionProps {
  category: Category;
  entries: BudgetEntry[];
  budget: number;
  current: number;
  quincena?: Quincena;
  onAdd: (
    name: string,
    amount: number,
    category: Category,
    quincena: Quincena,
    note?: string,
  ) => void;
  onEdit: (id: Id<"budgetEntries">, name: string, amount: number, note?: string) => void;
  onDelete: (id: Id<"budgetEntries">) => void;
  onReorder: (ids: Id<"budgetEntries">[]) => void;
  onTogglePaid: (id: Id<"budgetEntries">, paid: boolean) => void;
  onResetQuincena: (quincena: Quincena) => void;
}

export function CategorySection({
  category,
  entries,
  budget,
  current,
  quincena,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  onTogglePaid,
  onResetQuincena,
}: CategorySectionProps) {
  const q1 = sortedEntries(entries.filter((entry) => entry.quincena === "1ra"));
  const q2 = sortedEntries(entries.filter((entry) => entry.quincena === "2da"));
  const variance = budget - current;
  const overBudget = variance < 0;
  const headingId = `${category}-worksheet-title${quincena ? `-${quincena}` : ""}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        "overflow-hidden rounded-lg border border-l-2 border-border bg-card",
        CATEGORY_BORDER[category],
      )}
    >
      <div className="flex min-h-11 items-center justify-between gap-3 bg-muted/45 px-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <h3
            id={headingId}
            className={cn("truncate text-xs font-semibold", CATEGORY_TEXT[category])}
          >
            {CATEGORY_LABELS[category]}
          </h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {CATEGORY_RULES[category]} rule
          </span>
        </div>
        <AddBudgetEntryDialog defaultCategory={category} defaultQuincena={quincena} onAdd={onAdd} />
      </div>

      <div className="grid grid-cols-3 border-y border-border bg-muted/20">
        <SummaryCell label="Target" value={budget} />
        <SummaryCell label="Planned" value={current} />
        <SummaryCell label="Variance" value={variance} negative={overBudget} isLast />
      </div>

      <div className="overflow-x-auto">
        <div
          role="grid"
          aria-label={`${CATEGORY_LABELS[category]} expenses`}
          className="min-w-[18rem] lg:min-w-0"
        >
          <div
            role="row"
            className="grid h-8 grid-cols-[1.75rem_1.75rem_minmax(8rem,1fr)_6.5rem] border-b border-border bg-muted/25 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground"
          >
            <div
              role="columnheader"
              aria-label="Reorder rows"
              className="grid place-items-center border-r border-border/70"
            >
              #
            </div>
            <div role="columnheader" className="grid place-items-center border-r border-border/70">
              Paid
            </div>
            <div role="columnheader" className="flex items-center px-2.5">
              Description
            </div>
            <div
              role="columnheader"
              className="flex items-center justify-end border-l border-border/70 px-2.5"
            >
              Amount
            </div>
          </div>

          {quincena ? (
            <QuincenaExpenseGroup
              label={quincena === "1ra" ? "1ra quincena" : "2da quincena"}
              entries={quincena === "1ra" ? q1 : q2}
              category={category}
              quincena={quincena}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
              onReorder={onReorder}
              onTogglePaid={onTogglePaid}
              onResetQuincena={onResetQuincena}
            />
          ) : (
            <>
              <QuincenaExpenseGroup
                label="1ra quincena"
                entries={q1}
                category={category}
                quincena="1ra"
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                onTogglePaid={onTogglePaid}
                onResetQuincena={onResetQuincena}
              />
              <QuincenaExpenseGroup
                label="2da quincena"
                entries={q2}
                category={category}
                quincena="2da"
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                onTogglePaid={onTogglePaid}
                onResetQuincena={onResetQuincena}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryCell({
  label,
  value,
  negative = false,
  isLast = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={cn("min-w-0 px-3 py-2.5", !isLast && "border-r border-border/70")}>
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 truncate font-mono text-xs font-semibold tabular-nums",
          negative && "text-destructive",
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

interface QuincenaExpenseGroupProps {
  label: string;
  entries: BudgetEntry[];
  category: Category;
  quincena: Quincena;
  onAdd: (
    name: string,
    amount: number,
    category: Category,
    quincena: Quincena,
    note?: string,
  ) => void;
  onEdit: (id: Id<"budgetEntries">, name: string, amount: number, note?: string) => void;
  onDelete: (id: Id<"budgetEntries">) => void;
  onReorder: (ids: Id<"budgetEntries">[]) => void;
  onTogglePaid: (id: Id<"budgetEntries">, paid: boolean) => void;
  onResetQuincena: (quincena: Quincena) => void;
}

function QuincenaExpenseGroup({
  label,
  entries,
  category,
  quincena,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  onTogglePaid,
  onResetQuincena,
}: QuincenaExpenseGroupProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const paidCount = entries.filter((entry) => entry.paid).length;
  const hasPaid = paidCount > 0;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((entry) => entry._id === active.id);
    const newIndex = entries.findIndex((entry) => entry._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(entries, oldIndex, newIndex);
    onReorder(reordered.map((entry) => entry._id));
  }

  function handleQuickAdd() {
    const name = window.prompt("Name:");
    if (!name) return;
    const amountInput = window.prompt("Amount:");
    if (!amountInput) return;
    const amount = parseFloat(amountInput);
    if (isNaN(amount)) return;
    onAdd(name.trim(), amount, category, quincena);
  }

  const ids = entries.map((entry) => entry._id);

  return (
    <div role="rowgroup">
      <div
        role="row"
        className="grid min-h-9 grid-cols-[1.75rem_1.75rem_minmax(8rem,1fr)_6.5rem] border-b border-border bg-muted/40 text-[11px]"
      >
        <div
          role="gridcell"
          className="col-span-2 flex items-center border-r border-border/70 px-2.5"
        >
          <span className="font-semibold lg:hidden">{label}</span>
          <span className="hidden font-semibold lg:inline">{quincena}</span>
        </div>
        <div role="gridcell" className="flex items-center justify-between gap-3 px-2.5">
          <span
            aria-label={`${paidCount} of ${entries.length} paid`}
            className="font-mono text-[10px] text-muted-foreground tabular-nums"
          >
            {paidCount}/{entries.length} <span className="lg:hidden">paid</span>
          </span>
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {hasPaid && (
              <button
                className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => onResetQuincena(quincena)}
                aria-label={`Reset payments for ${label}`}
                title={`Reset payments for ${label}`}
              >
                Reset
              </button>
            )}
            <button
              className="font-medium text-primary transition-opacity hover:opacity-75"
              onClick={handleQuickAdd}
              aria-label={`Quick add to ${label}`}
              title={`Quick add to ${label}`}
            >
              Add
            </button>
          </div>
        </div>
        <div
          role="gridcell"
          className="flex items-center justify-end border-l border-border/70 px-2.5 font-mono font-semibold tabular-nums"
        >
          {formatCurrency(total)}
        </div>
      </div>

      {entries.length === 0 ? (
        <div
          role="row"
          className="grid min-h-10 grid-cols-[3.5rem_minmax(8rem,1fr)_6.5rem] border-b border-border/70 text-xs text-muted-foreground"
        >
          <div role="gridcell" aria-label="Row controls" className="border-r border-border/70" />
          <div role="gridcell" className="flex items-center px-2.5">
            Add an expense for this pay period.
          </div>
          <div role="gridcell" aria-label="No amount" className="border-l border-border/70" />
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {entries.map((entry) => (
              <SortableEntryRow
                key={entry._id}
                id={entry._id}
                name={entry.name}
                amount={entry.amount}
                note={entry.note}
                paid={entry.paid}
                onEdit={(name, amount, note) => onEdit(entry._id, name, amount, note)}
                onDelete={() => onDelete(entry._id)}
                onTogglePaid={(paid) => onTogglePaid(entry._id, paid)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
