import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  budgetMonths: defineTable({
    userId: v.string(),
    year: v.number(),
    month: v.number(),
  }).index("by_user_year_month", ["userId", "year", "month"]),

  incomeEntries: defineTable({
    budgetMonthId: v.id("budgetMonths"),
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    note: v.optional(v.string()),
  }).index("by_budget_month", ["budgetMonthId"]),

  budgetEntries: defineTable({
    budgetMonthId: v.id("budgetMonths"),
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    category: v.union(v.literal("needs"), v.literal("wants"), v.literal("savings")),
    quincena: v.union(v.literal("1ra"), v.literal("2da")),
    note: v.optional(v.string()),
  }).index("by_budget_month", ["budgetMonthId"]),
});
