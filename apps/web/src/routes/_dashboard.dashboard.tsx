import { api } from "@budget/backend/convex/_generated/api";
import type { Id } from "@budget/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { CalendarRange } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { BudgetDonutChart } from "@/components/budget/BudgetDonutChart";
import { CategorySection } from "@/components/budget/CategorySection";
import { IncomeSection } from "@/components/budget/IncomeSection";
import { OverviewPanel } from "@/components/budget/OverviewPanel";
import type { Category, Quincena } from "@/components/budget/types";
import { DashboardDataProvider, useDashboardData } from "@/contexts/DashboardDataContext";

export const Route = createFileRoute("/_dashboard/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <DashboardDataProvider>
      <BudgetDashboard />
    </DashboardDataProvider>
  );
}

function BudgetDashboard() {
  const { data: rawData, isLoading } = useDashboardData();

  const upsertIncome = useMutation(api.budget.upsertIncomeEntry);
  const deleteIncome = useMutation(api.budget.deleteIncomeEntry);
  const reorderIncome = useMutation(api.budget.reorderIncomeEntries);
  const upsertEntry = useMutation(api.budget.upsertBudgetEntry);
  const deleteEntry = useMutation(api.budget.deleteBudgetEntry);
  const reorderEntries = useMutation(api.budget.reorderBudgetEntries);
  const togglePaid = useMutation(api.budget.toggleExpensePaid).withOptimisticUpdate(
    (localStore, args) => {
      const current = localStore.getQuery(api.budget.getData, {});
      if (current === undefined) return;
      localStore.setQuery(
        api.budget.getData,
        {},
        {
          ...current,
          budgetEntries: current.budgetEntries.map((e) =>
            e._id === args.id ? { ...e, paid: args.paid } : e,
          ),
        },
      );
    },
  );

  const resetQuincena = useMutation(api.budget.resetQuincenaPayments).withOptimisticUpdate(
    (localStore, args) => {
      const current = localStore.getQuery(api.budget.getData, {});
      if (current === undefined) return;
      localStore.setQuery(
        api.budget.getData,
        {},
        {
          ...current,
          budgetEntries: current.budgetEntries.map((e) =>
            e.quincena === args.quincena ? { ...e, paid: false } : e,
          ),
        },
      );
    },
  );

  const handleAddIncome = useCallback(
    (name: string, amount: number, note?: string) => {
      upsertIncome({ name, amount, note });
    },
    [upsertIncome],
  );

  const handleEditIncome = useCallback(
    (id: Id<"incomeEntries">, name: string, amount: number, note?: string) => {
      upsertIncome({ id, name, amount, note });
    },
    [upsertIncome],
  );

  const handleDeleteIncome = useCallback(
    (id: Id<"incomeEntries">) => {
      deleteIncome({ id });
    },
    [deleteIncome],
  );

  const handleReorderIncome = useCallback(
    (ids: Id<"incomeEntries">[]) => {
      reorderIncome({ ids });
    },
    [reorderIncome],
  );

  const handleAddEntry = useCallback(
    (name: string, amount: number, category: Category, quincena: Quincena, note?: string) => {
      upsertEntry({ name, amount, category, quincena, note });
    },
    [upsertEntry],
  );

  const handleEditEntry = useCallback(
    (id: Id<"budgetEntries">, name: string, amount: number, note?: string) => {
      const entry = rawData?.budgetEntries.find((e) => e._id === id);
      if (!entry) return;
      upsertEntry({
        id,
        name,
        amount,
        category: entry.category,
        quincena: entry.quincena,
        note,
      });
    },
    [upsertEntry, rawData],
  );

  const handleDeleteEntry = useCallback(
    (id: Id<"budgetEntries">) => {
      deleteEntry({ id });
    },
    [deleteEntry],
  );

  const handleReorderEntries = useCallback(
    (ids: Id<"budgetEntries">[]) => {
      reorderEntries({ ids });
    },
    [reorderEntries],
  );

  const handleTogglePaid = useCallback(
    (id: Id<"budgetEntries">, paid: boolean) => {
      togglePaid({ id, paid });
    },
    [togglePaid],
  );

  const handleResetQuincena = useCallback(
    (quincena: Quincena) => {
      resetQuincena({ quincena });
    },
    [resetQuincena],
  );

  if (isLoading || !rawData) {
    return (
      <div className="mx-auto max-w-[1600px] space-y-5 px-3 py-5 sm:px-5 lg:py-7">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <Skeleton className="h-72 lg:col-span-6" />
          <Skeleton className="h-72 lg:col-span-3" />
          <Skeleton className="h-72 lg:col-span-3" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  const needsEntries = rawData.budgetEntries.filter((e) => e.category === "needs");
  const wantsEntries = rawData.budgetEntries.filter((e) => e.category === "wants");
  const savingsEntries = rawData.budgetEntries.filter((e) => e.category === "savings");

  const totalIncome = rawData.incomeEntries.reduce((s, e) => s + e.amount, 0);
  const needsBudget = totalIncome * 0.5;
  const wantsBudget = totalIncome * 0.3;
  const savingsBudget = totalIncome * 0.2;

  const needsCurrent = needsEntries.reduce((s, e) => s + e.amount, 0);
  const wantsCurrent = wantsEntries.reduce((s, e) => s + e.amount, 0);
  const savingsCurrent = savingsEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="mx-auto max-w-[1600px] space-y-5 px-3 py-5 sm:px-5 lg:py-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Monthly plan
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep both quincenas in view and adjust the plan as money moves.
          </p>
        </div>
        <div className="flex w-fit items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm">
          <CalendarRange className="size-4 text-primary" aria-hidden="true" />
          Current month
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <OverviewPanel data={rawData} />
        </div>
        <div className="lg:col-span-3">
          <IncomeSection
            entries={rawData.incomeEntries}
            onAdd={handleAddIncome}
            onEdit={handleEditIncome}
            onDelete={handleDeleteIncome}
            onReorder={handleReorderIncome}
          />
        </div>
        <div className="lg:col-span-3">
          <BudgetDonutChart data={rawData} />
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 pt-2">
        <div>
          <h2 className="font-display text-xl font-semibold tracking-[-0.025em]">Expenses</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Compare each category with its monthly target.
          </p>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:block">50 / 30 / 20</span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CategorySection
          category="needs"
          entries={needsEntries}
          budget={needsBudget}
          current={needsCurrent}
          onAdd={handleAddEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onReorder={handleReorderEntries}
          onTogglePaid={handleTogglePaid}
          onResetQuincena={handleResetQuincena}
        />
        <CategorySection
          category="wants"
          entries={wantsEntries}
          budget={wantsBudget}
          current={wantsCurrent}
          onAdd={handleAddEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onReorder={handleReorderEntries}
          onTogglePaid={handleTogglePaid}
          onResetQuincena={handleResetQuincena}
        />
        <CategorySection
          category="savings"
          entries={savingsEntries}
          budget={savingsBudget}
          current={savingsCurrent}
          onAdd={handleAddEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onReorder={handleReorderEntries}
          onTogglePaid={handleTogglePaid}
          onResetQuincena={handleResetQuincena}
        />
      </div>
    </div>
  );
}
