import { ConvexError, v } from "convex/values";
import type { GenericMutationCtx } from "convex/server";

import { authComponent } from "./auth";
import { mutation, query } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";

// ─── Validators ────────────────────────────────────────────────────────────

const quincenaValidator = v.union(v.literal("1ra"), v.literal("2da"));
const categoryValidator = v.union(v.literal("needs"), v.literal("wants"), v.literal("savings"));

const incomeEntryValidator = v.object({
  _id: v.id("incomeEntries"),
  _creationTime: v.number(),
  budgetMonthId: v.id("budgetMonths"),
  userId: v.string(),
  name: v.string(),
  amount: v.number(),
  note: v.optional(v.string()),
});

const budgetEntryValidator = v.object({
  _id: v.id("budgetEntries"),
  _creationTime: v.number(),
  budgetMonthId: v.id("budgetMonths"),
  userId: v.string(),
  name: v.string(),
  amount: v.number(),
  category: categoryValidator,
  quincena: quincenaValidator,
  note: v.optional(v.string()),
});

const budgetMonthValidator = v.object({
  _id: v.id("budgetMonths"),
  _creationTime: v.number(),
  userId: v.string(),
  year: v.number(),
  month: v.number(),
});

// ─── Helper ─────────────────────────────────────────────────────────────────

async function requireUser(ctx: GenericMutationCtx<DataModel>) {
  const user = await authComponent.safeGetAuthUser(ctx);
  if (!user) {
    throw new ConvexError("Not authenticated");
  }
  return { ...user, userId: String(user._id) };
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const getOrCreateMonth = mutation({
  args: {
    year: v.number(),
    month: v.number(),
  },
  returns: budgetMonthValidator,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const userId = user.userId;

    const existing = await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) =>
        q.eq("userId", userId).eq("year", args.year).eq("month", args.month),
      )
      .unique();

    if (existing) return existing;

    const id = await ctx.db.insert("budgetMonths", {
      userId,
      year: args.year,
      month: args.month,
    });
    return (await ctx.db.get("budgetMonths", id))!;
  },
});

export const getMonthData = query({
  args: {
    budgetMonthId: v.id("budgetMonths"),
  },
  returns: v.union(
    v.object({
      month: budgetMonthValidator,
      incomeEntries: v.array(incomeEntryValidator),
      budgetEntries: v.array(budgetEntryValidator),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return null;

    const month = await ctx.db.get("budgetMonths", args.budgetMonthId);
    if (!month || month.userId !== String(user._id)) return null;

    const incomeEntries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_budget_month", (q) => q.eq("budgetMonthId", args.budgetMonthId))
      .collect();

    const budgetEntries = await ctx.db
      .query("budgetEntries")
      .withIndex("by_budget_month", (q) => q.eq("budgetMonthId", args.budgetMonthId))
      .collect();

    return { month, incomeEntries, budgetEntries };
  },
});

export const listMonths = query({
  args: {},
  returns: v.array(budgetMonthValidator),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("budgetMonths")
      .withIndex("by_user_year_month", (q) => q.eq("userId", String(user._id)))
      .order("desc")
      .collect();
  },
});

// ─── Income Mutations ────────────────────────────────────────────────────────

export const upsertIncomeEntry = mutation({
  args: {
    id: v.optional(v.id("incomeEntries")),
    budgetMonthId: v.id("budgetMonths"),
    name: v.string(),
    amount: v.number(),
    note: v.optional(v.string()),
  },
  returns: v.id("incomeEntries"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const month = await ctx.db.get("budgetMonths", args.budgetMonthId);
    if (!month || month.userId !== user.userId) {
      throw new ConvexError("Budget month not found");
    }

    if (args.id) {
      const entry = await ctx.db.get("incomeEntries", args.id);
      if (!entry || entry.userId !== user.userId) {
        throw new ConvexError("Income entry not found");
      }
      await ctx.db.patch("incomeEntries", args.id, {
        name: args.name,
        amount: args.amount,
        note: args.note,
      });
      return args.id;
    }

    return await ctx.db.insert("incomeEntries", {
      budgetMonthId: args.budgetMonthId,
      userId: user.userId,
      name: args.name,
      amount: args.amount,
      note: args.note,
    });
  },
});

export const deleteIncomeEntry = mutation({
  args: { id: v.id("incomeEntries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const entry = await ctx.db.get("incomeEntries", args.id);
    if (!entry || entry.userId !== user.userId) {
      throw new ConvexError("Income entry not found");
    }
    await ctx.db.delete("incomeEntries", args.id);
    return null;
  },
});

// ─── Budget Entry Mutations ─────────────────────────────────────────────────

export const upsertBudgetEntry = mutation({
  args: {
    id: v.optional(v.id("budgetEntries")),
    budgetMonthId: v.id("budgetMonths"),
    name: v.string(),
    amount: v.number(),
    category: categoryValidator,
    quincena: quincenaValidator,
    note: v.optional(v.string()),
  },
  returns: v.id("budgetEntries"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const month = await ctx.db.get("budgetMonths", args.budgetMonthId);
    if (!month || month.userId !== user.userId) {
      throw new ConvexError("Budget month not found");
    }

    if (args.id) {
      const entry = await ctx.db.get("budgetEntries", args.id);
      if (!entry || entry.userId !== user.userId) {
        throw new ConvexError("Budget entry not found");
      }
      await ctx.db.patch("budgetEntries", args.id, {
        name: args.name,
        amount: args.amount,
        category: args.category,
        quincena: args.quincena,
        note: args.note,
      });
      return args.id;
    }

    return await ctx.db.insert("budgetEntries", {
      budgetMonthId: args.budgetMonthId,
      userId: user.userId,
      name: args.name,
      amount: args.amount,
      category: args.category,
      quincena: args.quincena,
      note: args.note,
    });
  },
});

export const deleteBudgetEntry = mutation({
  args: { id: v.id("budgetEntries") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const entry = await ctx.db.get("budgetEntries", args.id);
    if (!entry || entry.userId !== user.userId) {
      throw new ConvexError("Budget entry not found");
    }
    await ctx.db.delete("budgetEntries", args.id);
    return null;
  },
});
