import { forwardRef } from "react";
import {
  type Category,
  CATEGORY_LABELS,
  CATEGORY_RATIOS,
  formatCurrency,
  type UserData,
  computeBudgetStats,
} from "./types";

interface BudgetSnapshotProps {
  data: UserData;
  month?: string;
}

const CATEGORY_BAR: Record<Category, string> = {
  needs: "var(--color-needs)",
  wants: "var(--color-wants)",
  savings: "var(--color-savings)",
};

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "var(--color-needs)",
  wants: "var(--color-wants)",
  savings: "var(--color-savings)",
};

export const BudgetSnapshot = forwardRef<HTMLDivElement, BudgetSnapshotProps>(
  ({ data, month }, ref) => {
    const stats = computeBudgetStats(data);
    const { totalIncome, categories, q1Expenses, q2Expenses, totalRestante } = stats;

    const now = new Date();
    const label = month ?? now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
      <div
        ref={ref}
        style={{
          width: 420,
          backgroundColor: "var(--card)",
          borderRadius: 12,
          padding: "28px 32px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "var(--card-foreground)",
          boxSizing: "border-box",
          border: "1px solid var(--border)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--muted-foreground)",
              }}
            >
              Budget Summary
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700 }}>
              {formatCurrency(totalIncome)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--muted-foreground)" }}>
              total income
            </p>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "var(--muted-foreground)",
              fontWeight: 500,
              textAlign: "right",
              paddingTop: 4,
            }}
          >
            {label}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "var(--border)", marginBottom: 20 }} />

        {/* 50/30/20 rows */}
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          50/30/20 Breakdown
        </p>
        {categories.map(({ cat, budget, current }) => {
          const pct = budget > 0 ? Math.min(100, (current / budget) * 100) : 0;
          const over = current > budget;
          return (
            <div key={cat} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: CATEGORY_TEXT[cat],
                  }}
                >
                  {CATEGORY_LABELS[cat]}{" "}
                  <span style={{ fontWeight: 400, color: "var(--muted-foreground)" }}>
                    ({Math.round(CATEGORY_RATIOS[cat] * 100)}%)
                  </span>
                </span>
                <span style={{ fontSize: 12, color: "var(--foreground)" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: over ? "var(--destructive)" : "var(--foreground)",
                    }}
                  >
                    {formatCurrency(current)}
                  </span>{" "}
                  <span style={{ color: "var(--muted-foreground)" }}>
                    / {formatCurrency(budget)}
                  </span>
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  backgroundColor: "var(--muted)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    backgroundColor: over ? "var(--destructive)" : CATEGORY_BAR[cat],
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "var(--border)", margin: "20px 0" }} />

        {/* Quincena breakdown */}
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted-foreground)",
          }}
        >
          By Quincena
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {(
            [
              {
                label: "1ra Quincena",
                expenses: q1Expenses,
                remaining: totalIncome / 2 - q1Expenses,
              },
              {
                label: "2da Quincena",
                expenses: q2Expenses,
                remaining: totalIncome / 2 - q2Expenses,
              },
            ] as const
          ).map(({ label, expenses, remaining }) => {
            const isNegative = remaining < 0;
            return (
              <div
                key={label}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                }}
              >
                <div style={{ padding: "12px 14px" }}>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--foreground)",
                    }}
                  >
                    {label}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{ fontSize: 10, color: "var(--muted-foreground)", fontWeight: 500 }}
                    >
                      Gastos
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)" }}>
                      {formatCurrency(expenses)}
                    </span>
                  </div>
                  <div style={{ height: 1, backgroundColor: "var(--border)", marginBottom: 8 }} />
                  <div
                    style={{
                      backgroundColor: isNegative
                        ? "color-mix(in oklch, var(--destructive) 10%, transparent)"
                        : "var(--muted)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: isNegative ? "var(--destructive)" : "var(--muted-foreground)",
                      }}
                    >
                      Restante
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: isNegative ? "var(--destructive)" : "var(--foreground)",
                      }}
                    >
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total restante */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "var(--muted)",
            borderRadius: 10,
            padding: "10px 14px",
            marginTop: 10,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>Total Restante</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: totalRestante < 0 ? "var(--destructive)" : "var(--color-savings)",
            }}
          >
            {formatCurrency(totalRestante)}
          </span>
        </div>

        {/* Footer */}
        <p
          style={{
            margin: "18px 0 0",
            fontSize: 10,
            color: "var(--muted-foreground)",
            textAlign: "center",
            letterSpacing: "0.04em",
            opacity: 0.5,
          }}
        >
          50/30/20 Budget Tracker
        </p>
      </div>
    );
  },
);

BudgetSnapshot.displayName = "BudgetSnapshot";
