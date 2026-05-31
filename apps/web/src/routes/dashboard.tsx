import { Show } from "@clerk/react";
import { api } from "@budget/backend/convex/_generated/api";
import type { Id } from "@budget/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { useCallback, useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Skeleton } from "@/components/ui/skeleton";
import { BudgetDonutChart } from "@/components/budget/BudgetDonutChart";
import { CategorySection } from "@/components/budget/CategorySection";
import { IncomeSection } from "@/components/budget/IncomeSection";
import { OverviewPanel } from "@/components/budget/OverviewPanel";
import type { Category, Quincena } from "@/components/budget/types";
import { DashboardDataProvider, useDashboardData } from "@/contexts/DashboardDataContext";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Show when="signed-in">
        <DashboardDataProvider>
          <BudgetDashboard />
        </DashboardDataProvider>
      </Show>
      <Show when="signed-out" fallback={null}>
        <div className="flex items-center justify-center min-h-[60vh]">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </Show>
    </>
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
      <div className="space-y-4 py-4 md:py-6 px-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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
    <div className="space-y-4 py-4 md:py-6 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <IncomeSection
            entries={rawData.incomeEntries}
            onAdd={handleAddIncome}
            onEdit={handleEditIncome}
            onDelete={handleDeleteIncome}
            onReorder={handleReorderIncome}
          />
        </div>
        <div>
          <OverviewPanel data={rawData} />
        </div>
        <div>
          <BudgetDonutChart data={rawData} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Expenses
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
