import { api } from "@budget/backend/convex/_generated/api";
import type { Id } from "@budget/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback } from "react";
import { CalendarRange, ClipboardPaste } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="mx-auto max-w-[1600px] space-y-4 px-3 py-4 sm:px-5 lg:py-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
          <Skeleton className="h-72" />
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

  const categoryConfigs = [
    {
      category: "needs" as const,
      entries: needsEntries,
      budget: needsBudget,
      current: needsCurrent,
    },
    {
      category: "wants" as const,
      entries: wantsEntries,
      budget: wantsBudget,
      current: wantsCurrent,
    },
    {
      category: "savings" as const,
      entries: savingsEntries,
      budget: savingsBudget,
      current: savingsCurrent,
    },
  ];

  function renderCategorySections(quincena?: Quincena) {
    return categoryConfigs.map((config) => (
      <CategorySection
        key={`${config.category}-${quincena ?? "both"}`}
        {...config}
        quincena={quincena}
        onAdd={handleAddEntry}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        onReorder={handleReorderEntries}
        onTogglePaid={handleTogglePaid}
        onResetQuincena={handleResetQuincena}
      />
    ));
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 px-3 py-4 sm:px-5 lg:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.035em]">
            Monthly budget
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A worksheet view for income, expenses, and both quincenas.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 font-medium">
            <ClipboardPaste className="size-3.5 text-primary" aria-hidden="true" />
            Paste two Excel cells when adding
          </span>
          <span className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 font-medium">
            <CalendarRange className="size-3.5 text-primary" aria-hidden="true" />
            Current month
          </span>
        </div>
      </div>

      <OverviewPanel data={rawData} />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section aria-labelledby="expense-ledger-title" className="min-w-0 space-y-3">
          <div className="flex items-end justify-between gap-4 px-0.5">
            <div>
              <h2 id="expense-ledger-title" className="text-sm font-semibold">
                Expense ledger
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Right-click a row to edit or delete it.
              </p>
            </div>
            <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">
              50% needs / 30% wants / 20% savings
            </span>
          </div>

          <div className="hidden items-start gap-4 lg:grid lg:grid-cols-3">
            {renderCategorySections()}
          </div>

          <div className="space-y-6 lg:hidden">
            {(["1ra", "2da"] as Quincena[]).map((quincena) => (
              <div key={quincena} className="space-y-3">
                <div className="flex items-baseline justify-between gap-3 border-b border-border px-0.5 pb-2">
                  <h3 className="text-sm font-semibold">
                    {quincena === "1ra" ? "1ra quincena" : "2da quincena"}
                  </h3>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {quincena === "1ra" ? "Start here" : "Continue here"}
                  </span>
                </div>
                <div className="space-y-3">{renderCategorySections(quincena)}</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="xl:sticky xl:top-[4.5rem]">
          <IncomeSection
            entries={rawData.incomeEntries}
            onAdd={handleAddIncome}
            onEdit={handleEditIncome}
            onDelete={handleDeleteIncome}
            onReorder={handleReorderIncome}
          />
        </aside>
      </div>
    </div>
  );
}
