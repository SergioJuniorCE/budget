import { api } from "@budget/backend/convex/_generated/api";
import type { Id } from "@budget/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { Authenticated, AuthLoading, Unauthenticated, useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { Skeleton } from "@/components/ui/skeleton";
import { AddBudgetEntryDialog } from "@/components/budget/AddEntryDialog";
import { CategorySection } from "@/components/budget/CategorySection";
import { IncomeSection } from "@/components/budget/IncomeSection";
import { MonthNavigator } from "@/components/budget/MonthNavigator";
import { OverviewPanel } from "@/components/budget/OverviewPanel";
import type { Category, MonthData, Quincena } from "@/components/budget/types";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <Authenticated>
        <BudgetDashboard />
      </Authenticated>
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[60vh]">
          {showSignIn ? (
            <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
          ) : (
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
          )}
        </div>
      </Unauthenticated>
      <AuthLoading>
        <div className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AuthLoading>
    </>
  );
}

function BudgetDashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const getOrCreateMonth = useMutation(api.budget.getOrCreateMonth);
  const [budgetMonthId, setBudgetMonthId] = useState<Id<"budgetMonths"> | null>(null);
  const [loading, setLoading] = useState(false);

  // Ensure the budget month exists when year/month changes
  const ensureMonth = useCallback(
    async (y: number, m: number) => {
      setLoading(true);
      try {
        const result = await getOrCreateMonth({ year: y, month: m });
        setBudgetMonthId(result._id);
      } finally {
        setLoading(false);
      }
    },
    [getOrCreateMonth],
  );

  const initializedRef = useRef(false);
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      ensureMonth(year, month);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToPrev() {
    let y = year;
    let m = month - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setYear(y);
    setMonth(m);
    ensureMonth(y, m);
  }

  function goToNext() {
    let y = year;
    let m = month + 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
    ensureMonth(y, m);
  }

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-screen-2xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <MonthNavigator year={year} month={month} onPrev={goToPrev} onNext={goToNext} />
      </div>

      {loading || !budgetMonthId ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : (
        <BudgetContent budgetMonthId={budgetMonthId} />
      )}
    </div>
  );
}

interface BudgetContentProps {
  budgetMonthId: Id<"budgetMonths">;
}

function BudgetContent({ budgetMonthId }: BudgetContentProps) {
  const rawData = useQuery(api.budget.getMonthData, { budgetMonthId });

  const upsertIncome = useMutation(api.budget.upsertIncomeEntry);
  const deleteIncome = useMutation(api.budget.deleteIncomeEntry);
  const upsertEntry = useMutation(api.budget.upsertBudgetEntry);
  const deleteEntry = useMutation(api.budget.deleteBudgetEntry);

  // ── Income handlers ────────────────────────────────────────────────────────

  function handleAddIncome(name: string, amount: number, note?: string) {
    upsertIncome({ budgetMonthId, name, amount, note });
  }

  function handleEditIncome(id: Id<"incomeEntries">, name: string, amount: number, note?: string) {
    upsertIncome({ id, budgetMonthId, name, amount, note });
  }

  function handleDeleteIncome(id: Id<"incomeEntries">) {
    deleteIncome({ id });
  }

  // ── Budget entry handlers ──────────────────────────────────────────────────

  function handleAddEntry(
    name: string,
    amount: number,
    category: Category,
    quincena: Quincena,
    note?: string,
  ) {
    upsertEntry({ budgetMonthId, name, amount, category, quincena, note });
  }

  function handleEditEntry(id: Id<"budgetEntries">, name: string, amount: number, note?: string) {
    const entry = rawData?.budgetEntries.find((e) => e._id === id);
    if (!entry) return;
    upsertEntry({
      id,
      budgetMonthId,
      name,
      amount,
      category: entry.category,
      quincena: entry.quincena,
      note,
    });
  }

  function handleDeleteEntry(id: Id<"budgetEntries">) {
    deleteEntry({ id });
  }

  if (rawData === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (rawData === null) {
    return (
      <div className="text-center text-muted-foreground py-12 text-sm">
        Could not load budget data.
      </div>
    );
  }

  const data: MonthData = rawData;

  const needsEntries = data.budgetEntries.filter((e) => e.category === "needs");
  const wantsEntries = data.budgetEntries.filter((e) => e.category === "wants");
  const savingsEntries = data.budgetEntries.filter((e) => e.category === "savings");

  const totalIncome = data.incomeEntries.reduce((s, e) => s + e.amount, 0);
  const needsBudget = totalIncome * 0.5;
  const wantsBudget = totalIncome * 0.3;
  const savingsBudget = totalIncome * 0.2;

  const needsCurrent = needsEntries.reduce((s, e) => s + e.amount, 0);
  const wantsCurrent = wantsEntries.reduce((s, e) => s + e.amount, 0);
  const savingsCurrent = savingsEntries.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      {/* Top row: Income + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <IncomeSection
            entries={data.incomeEntries}
            onAdd={handleAddIncome}
            onEdit={handleEditIncome}
            onDelete={handleDeleteIncome}
          />
        </div>
        <div>
          <OverviewPanel data={data} />
        </div>
      </div>

      {/* Bottom row: Needs / Wants / Savings */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Expenses
        </h2>
        <AddBudgetEntryDialog onAdd={handleAddEntry} />
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
        />
        <CategorySection
          category="wants"
          entries={wantsEntries}
          budget={wantsBudget}
          current={wantsCurrent}
          onAdd={handleAddEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
        <CategorySection
          category="savings"
          entries={savingsEntries}
          budget={savingsBudget}
          current={savingsCurrent}
          onAdd={handleAddEntry}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      </div>
    </div>
  );
}
