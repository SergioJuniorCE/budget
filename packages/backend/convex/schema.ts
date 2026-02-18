import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  incomeEntries: defineTable({
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    note: v.optional(v.string()),
    order: v.optional(v.number()),
    // Temporary: kept optional while migrating away from month-based architecture
    budgetMonthId: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  budgetEntries: defineTable({
    userId: v.string(),
    name: v.string(),
    amount: v.number(),
    category: v.union(v.literal("needs"), v.literal("wants"), v.literal("savings")),
    quincena: v.union(v.literal("1ra"), v.literal("2da")),
    note: v.optional(v.string()),
    order: v.optional(v.number()),
    // Temporary: kept optional while migrating away from month-based architecture
    budgetMonthId: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
