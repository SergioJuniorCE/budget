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

const CATEGORY_COLORS: Record<Category, string> = {
  needs: "text-needs",
  wants: "text-wants",
  savings: "text-savings",
};

const CATEGORY_BG: Record<Category, string> = {
  needs: "bg-needs",
  wants: "bg-wants",
  savings: "bg-savings",
};

const CATEGORY_BORDER: Record<Category, string> = {
  needs: "border-t-needs",
  wants: "border-t-wants",
  savings: "border-t-savings",
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
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  onTogglePaid,
  onResetQuincena,
}: CategorySectionProps) {
  const q1 = sortedEntries(entries.filter((e) => e.quincena === "1ra"));
  const q2 = sortedEntries(entries.filter((e) => e.quincena === "2da"));
  const q1Total = q1.reduce((s, e) => s + e.amount, 0);
  const q2Total = q2.reduce((s, e) => s + e.amount, 0);

  const pct = budget > 0 ? Math.min(100, (current / budget) * 100) : 0;
  const overBudget = current > budget;

  return (
    <Card className={cn("flex flex-col gap-0 border-t-2", CATEGORY_BORDER[category])}>
      <CardHeader className="border-b border-border/70">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className={cn("font-semibold", CATEGORY_COLORS[category])}>
              {CATEGORY_LABELS[category]}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {category === "needs" ? "50%" : category === "wants" ? "30%" : "20%"}
            </span>
          </div>
          <AddBudgetEntryDialog defaultCategory={category} onAdd={onAdd} />
        </CardTitle>
        <div className="mt-2 space-y-1.5">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                CATEGORY_BG[category],
                overBudget && "bg-destructive",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
            <span>{formatCurrency(current)} planned</span>
            <span>{formatCurrency(budget)} target</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-3">
        <div className="grid flex-1 grid-cols-1 items-stretch divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <QuincenaExpenseColumn
            label="1ra Quincena"
            entries={q1}
            total={q1Total}
            category={category}
            quincena="1ra"
            className="pb-3 sm:pr-3 sm:pb-0"
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
            onTogglePaid={onTogglePaid}
            onResetQuincena={onResetQuincena}
          />
          <QuincenaExpenseColumn
            label="2da Quincena"
            entries={q2}
            total={q2Total}
            category={category}
            quincena="2da"
            className="pt-3 sm:pt-0 sm:pl-3"
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onReorder={onReorder}
            onTogglePaid={onTogglePaid}
            onResetQuincena={onResetQuincena}
          />
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/65 px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Category total</span>
          <span
            className={cn("text-xs font-semibold tabular-nums", overBudget && "text-destructive")}
          >
            {formatCurrency(current)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface QuincenaExpenseColumnProps {
  label: string;
  entries: BudgetEntry[];
  total: number;
  category: Category;
  quincena: Quincena;
  className?: string;
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

function QuincenaExpenseColumn({
  label,
  entries,
  total,
  category,
  quincena,
  className,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  onTogglePaid,
  onResetQuincena,
}: QuincenaExpenseColumnProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const paidCount = entries.filter((e) => e.paid).length;
  const hasPaid = paidCount > 0;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e._id === active.id);
    const newIndex = entries.findIndex((e) => e._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(entries, oldIndex, newIndex);
    onReorder(reordered.map((e) => e._id));
  }

  const ids = entries.map((e) => e._id);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="mb-1 flex min-h-8 items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-xs text-muted-foreground font-medium shrink-0">{label}</p>
          {entries.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {paidCount}/{entries.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasPaid && (
            <button
              className="min-h-11 text-xs text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
              onClick={() => onResetQuincena(quincena)}
              aria-label={`Reset payments for ${label}`}
            >
              Reset
            </button>
          )}
          <button
            className="min-h-11 text-xs text-muted-foreground transition-colors hover:text-foreground sm:min-h-0"
            onClick={() => {
              const name = window.prompt("Name:");
              if (!name) return;
              const amtStr = window.prompt("Amount:");
              if (!amtStr) return;
              const amount = parseFloat(amtStr);
              if (isNaN(amount)) return;
              onAdd(name.trim(), amount, category, quincena);
            }}
            aria-label={`Quick add to ${label}`}
          >
            + Quick
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col border-t border-border/50">
        {entries.length === 0 && (
          <p className="py-3 text-xs leading-relaxed text-muted-foreground">
            Add an expense for this quincena.
          </p>
        )}
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
      </div>
      <div className="border-t mt-1 pt-1 flex justify-between">
        <span className="text-xs text-muted-foreground">Subtotal</span>
        <span className="text-xs tabular-nums font-medium">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
