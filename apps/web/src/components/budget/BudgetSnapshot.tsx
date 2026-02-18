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
  needs: "#3b82f6",
  wants: "#f59e0b",
  savings: "#10b981",
};

const CATEGORY_TEXT: Record<Category, string> = {
  needs: "#2563eb",
  wants: "#d97706",
  savings: "#059669",
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
          backgroundColor: "#ffffff",
          borderRadius: 16,
          padding: "28px 32px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          color: "#111827",
          boxSizing: "border-box",
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
                color: "#6b7280",
              }}
            >
              Budget Summary
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700 }}>
              {formatCurrency(totalIncome)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>total income</p>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#6b7280",
              fontWeight: 500,
              textAlign: "right",
              paddingTop: 4,
            }}
          >
            {label}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "#f3f4f6", marginBottom: 20 }} />

        {/* 50/30/20 rows */}
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9ca3af",
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
                  <span style={{ fontWeight: 400, color: "#9ca3af" }}>
                    ({Math.round(CATEGORY_RATIOS[cat] * 100)}%)
                  </span>
                </span>
                <span style={{ fontSize: 12, color: "#374151" }}>
                  <span
                    style={{
                      fontWeight: 700,
                      color: over ? "#ef4444" : "#111827",
                    }}
                  >
                    {formatCurrency(current)}
                  </span>{" "}
                  <span style={{ color: "#9ca3af" }}>/ {formatCurrency(budget)}</span>
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  backgroundColor: "#f3f4f6",
                  borderRadius: 99,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    backgroundColor: over ? "#ef4444" : CATEGORY_BAR[cat],
                    borderRadius: 99,
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, backgroundColor: "#f3f4f6", margin: "20px 0" }} />

        {/* Quincena breakdown */}
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#9ca3af",
          }}
        >
          Expenses by Quincena
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 13, color: "#374151" }}>1ra Quincena</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(q1Expenses)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 13, color: "#374151" }}>2da Quincena</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(q2Expenses)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f9fafb",
            borderRadius: 10,
            padding: "10px 14px",
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 700 }}>Restante</span>
          <span
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: totalRestante < 0 ? "#ef4444" : "#059669",
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
            color: "#d1d5db",
            textAlign: "center",
            letterSpacing: "0.04em",
          }}
        >
          50/30/20 Budget Tracker
        </p>
      </div>
    );
  },
);

BudgetSnapshot.displayName = "BudgetSnapshot";
