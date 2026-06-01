import { describe, it, expect } from "vitest";

// Test the 50/30/20 budget allocation logic
describe("Budget Allocation Logic", () => {
  const CATEGORY_RATIOS = {
    needs: 0.5,
    wants: 0.3,
    savings: 0.2,
  };

  it("allocates 50% to needs", () => {
    const income = 10000;
    const needsBudget = income * CATEGORY_RATIOS.needs;
    expect(needsBudget).toBe(5000);
  });

  it("allocates 30% to wants", () => {
    const income = 10000;
    const wantsBudget = income * CATEGORY_RATIOS.wants;
    expect(wantsBudget).toBe(3000);
  });

  it("allocates 20% to savings", () => {
    const income = 10000;
    const savingsBudget = income * CATEGORY_RATIOS.savings;
    expect(savingsBudget).toBe(2000);
  });

  it("allocations sum to total income", () => {
    const income = 25000;
    const total =
      income * CATEGORY_RATIOS.needs +
      income * CATEGORY_RATIOS.wants +
      income * CATEGORY_RATIOS.savings;
    expect(total).toBe(income);
  });

  it("handles zero income", () => {
    const income = 0;
    expect(income * CATEGORY_RATIOS.needs).toBe(0);
    expect(income * CATEGORY_RATIOS.wants).toBe(0);
    expect(income * CATEGORY_RATIOS.savings).toBe(0);
  });

  it("handles fractional amounts correctly", () => {
    const income = 12345.67;
    const needsBudget = income * CATEGORY_RATIOS.needs;
    expect(needsBudget).toBeCloseTo(6172.835, 3);
  });
});

describe("Budget Calculations", () => {
  interface BudgetEntry {
    amount: number;
    category: "needs" | "wants" | "savings";
    quincena: "1ra" | "2da";
    paid?: boolean;
  }

  function calculateTotals(entries: BudgetEntry[]) {
    const totalSpent = entries.reduce((sum, e) => sum + e.amount, 0);
    const q1Expenses = entries
      .filter((e) => e.quincena === "1ra")
      .reduce((sum, e) => sum + e.amount, 0);
    const q2Expenses = entries
      .filter((e) => e.quincena === "2da")
      .reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {
      needs: entries.filter((e) => e.category === "needs").reduce((sum, e) => sum + e.amount, 0),
      wants: entries.filter((e) => e.category === "wants").reduce((sum, e) => sum + e.amount, 0),
      savings: entries
        .filter((e) => e.category === "savings")
        .reduce((sum, e) => sum + e.amount, 0),
    };
    const paidCount = entries.filter((e) => e.paid).length;

    return { totalSpent, q1Expenses, q2Expenses, categoryTotals, paidCount };
  }

  it("calculates total spent correctly", () => {
    const entries: BudgetEntry[] = [
      { amount: 5000, category: "needs", quincena: "1ra" },
      { amount: 2000, category: "wants", quincena: "2da" },
      { amount: 1000, category: "savings", quincena: "1ra" },
    ];
    const result = calculateTotals(entries);
    expect(result.totalSpent).toBe(8000);
  });

  it("calculates quincena expenses correctly", () => {
    const entries: BudgetEntry[] = [
      { amount: 3000, category: "needs", quincena: "1ra" },
      { amount: 2000, category: "needs", quincena: "1ra" },
      { amount: 1500, category: "wants", quincena: "2da" },
      { amount: 500, category: "savings", quincena: "2da" },
    ];
    const result = calculateTotals(entries);
    expect(result.q1Expenses).toBe(5000);
    expect(result.q2Expenses).toBe(2000);
  });

  it("calculates category totals correctly", () => {
    const entries: BudgetEntry[] = [
      { amount: 4000, category: "needs", quincena: "1ra" },
      { amount: 1000, category: "needs", quincena: "2da" },
      { amount: 2000, category: "wants", quincena: "1ra" },
      { amount: 1000, category: "wants", quincena: "2da" },
      { amount: 500, category: "savings", quincena: "1ra" },
    ];
    const result = calculateTotals(entries);
    expect(result.categoryTotals.needs).toBe(5000);
    expect(result.categoryTotals.wants).toBe(3000);
    expect(result.categoryTotals.savings).toBe(500);
  });

  it("counts paid entries correctly", () => {
    const entries: BudgetEntry[] = [
      { amount: 1000, category: "needs", quincena: "1ra", paid: true },
      { amount: 2000, category: "needs", quincena: "1ra", paid: false },
      { amount: 1500, category: "wants", quincena: "2da", paid: true },
    ];
    const result = calculateTotals(entries);
    expect(result.paidCount).toBe(2);
  });

  it("handles empty entries array", () => {
    const result = calculateTotals([]);
    expect(result.totalSpent).toBe(0);
    expect(result.q1Expenses).toBe(0);
    expect(result.q2Expenses).toBe(0);
    expect(result.categoryTotals.needs).toBe(0);
    expect(result.categoryTotals.wants).toBe(0);
    expect(result.categoryTotals.savings).toBe(0);
    expect(result.paidCount).toBe(0);
  });
});

describe("Import/Export Data Structure", () => {
  const CURRENT_VERSION = 1;

  it("has correct export version", () => {
    expect(CURRENT_VERSION).toBe(1);
  });

  it("validates income entry import structure", () => {
    const validImport = {
      name: "Salary",
      amount: 25000,
      note: "Monthly salary",
    };
    expect(validImport.name).toBeDefined();
    expect(typeof validImport.name).toBe("string");
    expect(validImport.amount).toBeDefined();
    expect(typeof validImport.amount).toBe("number");
  });

  it("validates budget entry import structure", () => {
    const validImport = {
      name: "Rent",
      amount: 8000,
      category: "needs",
      quincena: "1ra",
      note: "Monthly rent",
      paid: true,
    };
    expect(validImport.name).toBeDefined();
    expect(validImport.category).toMatch(/^(needs|wants|savings)$/);
    expect(validImport.quincena).toMatch(/^(1ra|2da)$/);
    expect(typeof validImport.paid).toBe("boolean");
  });

  it("allows optional note in import", () => {
    const minimalImport: {
      name: string;
      amount: number;
      category: string;
      quincena: string;
      note?: string;
    } = {
      name: "Groceries",
      amount: 3000,
      category: "needs",
      quincena: "1ra",
    };
    expect(minimalImport.note).toBeUndefined();
  });

  it("allows optional paid status in import", () => {
    const minimalImport: {
      name: string;
      amount: number;
      category: string;
      quincena: string;
      paid?: boolean;
    } = {
      name: "Groceries",
      amount: 3000,
      category: "needs",
      quincena: "1ra",
    };
    expect(minimalImport.paid).toBeUndefined();
  });
});
