import type { Id } from "@budget/backend/convex/_generated/dataModel";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CategorySection } from "./CategorySection";
import { formatCurrency, type BudgetEntry } from "./types";

const entries: BudgetEntry[] = [
  {
    _id: "needs-1" as Id<"budgetEntries">,
    _creationTime: 1,
    userId: "user-1",
    name: "Rent",
    amount: 8_000,
    category: "needs",
    quincena: "1ra",
  },
  {
    _id: "needs-2" as Id<"budgetEntries">,
    _creationTime: 2,
    userId: "user-1",
    name: "Utilities",
    amount: 1_000,
    category: "needs",
    quincena: "2da",
  },
];

describe("CategorySection", () => {
  it("renders both pay periods as one worksheet", () => {
    render(
      <CategorySection
        category="needs"
        entries={[]}
        budget={10_000}
        current={0}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
        onTogglePaid={vi.fn()}
        onResetQuincena={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "Needs" })).toBeInTheDocument();
    expect(screen.getByText("50% rule")).toBeInTheDocument();
    expect(screen.getAllByText(formatCurrency(10_000))).toHaveLength(2);

    const worksheet = screen.getByRole("grid", { name: "Needs expenses" });
    expect(worksheet).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Paid" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Description" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Amount" })).toBeInTheDocument();
    expect(screen.getByText("1ra quincena")).toBeInTheDocument();
    expect(screen.getByText("2da quincena")).toBeInTheDocument();
    expect(screen.getAllByText("Add an expense for this pay period.")).toHaveLength(2);
  });

  it("can focus one pay period for the narrow worksheet flow", () => {
    render(
      <CategorySection
        category="needs"
        entries={entries}
        budget={10_000}
        current={9_000}
        quincena="1ra"
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
        onTogglePaid={vi.fn()}
        onResetQuincena={vi.fn()}
      />,
    );

    expect(screen.getByText("1ra quincena")).toBeInTheDocument();
    expect(screen.queryByText("2da quincena")).not.toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.queryByText("Utilities")).not.toBeInTheDocument();
  });
});
