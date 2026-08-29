import type { Id } from "@budget/backend/convex/_generated/dataModel";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OverviewPanel } from "./OverviewPanel";
import { formatCurrency, type UserData } from "./types";

const data: UserData = {
  incomeEntries: [
    {
      _id: "income-1" as Id<"incomeEntries">,
      _creationTime: 1,
      userId: "user-1",
      name: "Salary",
      amount: 20_000,
    },
  ],
  budgetEntries: [
    {
      _id: "expense-1" as Id<"budgetEntries">,
      _creationTime: 2,
      userId: "user-1",
      name: "Rent",
      amount: 8_000,
      category: "needs",
      quincena: "1ra",
    },
    {
      _id: "expense-2" as Id<"budgetEntries">,
      _creationTime: 3,
      userId: "user-1",
      name: "Dining",
      amount: 7_000,
      category: "wants",
      quincena: "2da",
    },
    {
      _id: "expense-3" as Id<"budgetEntries">,
      _creationTime: 4,
      userId: "user-1",
      name: "Emergency fund",
      amount: 3_000,
      category: "savings",
      quincena: "2da",
    },
  ],
};

describe("OverviewPanel", () => {
  it("renders the monthly totals and allocation worksheet", () => {
    render(<OverviewPanel data={data} />);

    expect(screen.getByRole("heading", { name: "Monthly summary" })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Target" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Variance" })).toBeInTheDocument();

    const wantsRow = screen.getByRole("row", { name: /Wants 30%/ });
    expect(within(wantsRow).getByText(formatCurrency(6_000))).toBeInTheDocument();
    expect(within(wantsRow).getByText(formatCurrency(7_000))).toBeInTheDocument();
    expect(within(wantsRow).getByText(formatCurrency(-1_000))).toBeInTheDocument();
    expect(within(wantsRow).getByText("Over target")).toBeInTheDocument();

    const totalRow = screen.getByRole("row", { name: /Total 100%/ });
    expect(totalRow).toHaveTextContent(formatCurrency(20_000));
    expect(totalRow).toHaveTextContent(formatCurrency(18_000));
    expect(totalRow).toHaveTextContent(formatCurrency(2_000));
  });
});
