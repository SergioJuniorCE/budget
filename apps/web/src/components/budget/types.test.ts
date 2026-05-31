import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  computeBudgetStats,
  CATEGORY_LABELS,
  CATEGORY_RATIOS,
  type UserData,
} from "./types";

describe("CATEGORY_LABELS", () => {
  it("has correct labels for all categories", () => {
    expect(CATEGORY_LABELS.needs).toBe("Needs");
    expect(CATEGORY_LABELS.wants).toBe("Wants");
    expect(CATEGORY_LABELS.savings).toBe("Savings");
  });
});

describe("CATEGORY_RATIOS", () => {
  it("has correct ratios for 50/30/20 rule", () => {
    expect(CATEGORY_RATIOS.needs).toBe(0.5);
    expect(CATEGORY_RATIOS.wants).toBe(0.3);
    expect(CATEGORY_RATIOS.savings).toBe(0.2);
  });

  it("sums to 1", () => {
    const sum = CATEGORY_RATIOS.needs + CATEGORY_RATIOS.wants + CATEGORY_RATIOS.savings;
    expect(sum).toBe(1);
  });
});

describe("formatCurrency", () => {
  it("formats MXN currency correctly", () => {
    const result = formatCurrency(1000);
    expect(result).toContain("$");
    expect(result).toContain("1,000");
  });

  it("formats decimals correctly", () => {
    const result = formatCurrency(1000.5);
    expect(result).toContain("1,000.50");
  });

  it("handles zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("$");
    expect(result).toContain("0.00");
  });
});

describe("computeBudgetStats", () => {
  const mockData: UserData = {
    incomeEntries: [
      { _id: "inc1" as any, _creationTime: 1, userId: "user1", name: "Salary", amount: 10000 },
    ],
    budgetEntries: [
      {
        _id: "ent1" as any,
        _creationTime: 1,
        userId: "user1",
        name: "Rent",
        amount: 3000,
        category: "needs",
        quincena: "1ra",
      },
      {
        _id: "ent2" as any,
        _creationTime: 1,
        userId: "user1",
        name: "Dining",
        amount: 1000,
        category: "wants",
        quincena: "2da",
      },
      {
        _id: "ent3" as any,
        _creationTime: 1,
        userId: "user1",
        name: "Savings",
        amount: 500,
        category: "savings",
        quincena: "1ra",
      },
    ],
  };

  it("computes total income correctly", () => {
    const stats = computeBudgetStats(mockData);
    expect(stats.totalIncome).toBe(10000);
  });

  it("computes category budgets based on 50/30/20 rule", () => {
    const stats = computeBudgetStats(mockData);
    const needs = stats.categories.find((c) => c.cat === "needs");
    expect(needs?.budget).toBe(5000); // 50% of 10000

    const wants = stats.categories.find((c) => c.cat === "wants");
    expect(wants?.budget).toBe(3000); // 30% of 10000

    const savings = stats.categories.find((c) => c.cat === "savings");
    expect(savings?.budget).toBe(2000); // 20% of 10000
  });

  it("computes current spending per category", () => {
    const stats = computeBudgetStats(mockData);
    const needs = stats.categories.find((c) => c.cat === "needs");
    expect(needs?.current).toBe(3000);

    const wants = stats.categories.find((c) => c.cat === "wants");
    expect(wants?.current).toBe(1000);

    const savings = stats.categories.find((c) => c.cat === "savings");
    expect(savings?.current).toBe(500);
  });

  it("computes total spent correctly", () => {
    const stats = computeBudgetStats(mockData);
    expect(stats.totalNotAssigned).toBe(5500); // 10000 - 4500
  });

  it("computes quincena expenses correctly", () => {
    const stats = computeBudgetStats(mockData);
    expect(stats.q1Expenses).toBe(3500); // 3000 + 500
    expect(stats.q2Expenses).toBe(1000);
  });

  it("computes total restante correctly", () => {
    const stats = computeBudgetStats(mockData);
    expect(stats.totalRestante).toBe(5500); // 10000 - 4500
  });

  it("handles empty data", () => {
    const emptyData: UserData = { incomeEntries: [], budgetEntries: [] };
    const stats = computeBudgetStats(emptyData);
    expect(stats.totalIncome).toBe(0);
    expect(stats.totalNotAssigned).toBe(0);
    expect(stats.categories.every((c) => c.budget === 0)).toBe(true);
  });
});
