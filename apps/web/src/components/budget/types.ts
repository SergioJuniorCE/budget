import type { Id } from "@budget/backend/convex/_generated/dataModel";

export type Quincena = "1ra" | "2da";
export type Category = "needs" | "wants" | "savings";

export interface IncomeEntry {
  _id: Id<"incomeEntries">;
  _creationTime: number;
  userId: string;
  name: string;
  amount: number;
  note?: string;
}

export interface BudgetEntry {
  _id: Id<"budgetEntries">;
  _creationTime: number;
  userId: string;
  name: string;
  amount: number;
  category: Category;
  quincena: Quincena;
  note?: string;
}

export interface UserData {
  incomeEntries: IncomeEntry[];
  budgetEntries: BudgetEntry[];
}

export const CATEGORY_LABELS: Record<Category, string> = {
  needs: "Needs",
  wants: "Wants",
  savings: "Savings",
};

export const CATEGORY_RATIOS: Record<Category, number> = {
  needs: 0.5,
  wants: 0.3,
  savings: 0.2,
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function computeBudgetStats(data: UserData) {
  const totalIncome = data.incomeEntries.reduce((s, e) => s + e.amount, 0);

  const categories = (["needs", "wants", "savings"] as Category[]).map((cat) => {
    const budget = totalIncome * CATEGORY_RATIOS[cat];
    const current = data.budgetEntries
      .filter((e) => e.category === cat)
      .reduce((s, e) => s + e.amount, 0);
    const excedent = Math.max(0, budget - current);
    const spendable = budget + excedent;
    return { cat, budget, current, excedent, spendable };
  });

  const totalSpent = data.budgetEntries.reduce((s, e) => s + e.amount, 0);
  const totalNotAssigned = totalIncome - totalSpent;

  const q1Expenses = data.budgetEntries
    .filter((e) => e.quincena === "1ra")
    .reduce((s, e) => s + e.amount, 0);
  const q2Expenses = data.budgetEntries
    .filter((e) => e.quincena === "2da")
    .reduce((s, e) => s + e.amount, 0);
  const totalRestante = totalIncome - totalSpent;

  return {
    totalIncome,
    categories,
    totalNotAssigned,
    q1Expenses,
    q2Expenses,
    totalRestante,
  };
}
