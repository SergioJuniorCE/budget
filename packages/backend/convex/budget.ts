import { ConvexError, v } from "convex/values";
import type { GenericMutationCtx } from "convex/server";

import { authComponent } from "./auth";
import { internalMutation, mutation, query } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";

// ─── Validators ────────────────────────────────────────────────────────────

const quincenaValidator = v.union(v.literal("1ra"), v.literal("2da"));
const categoryValidator = v.union(v.literal("needs"), v.literal("wants"), v.literal("savings"));

const incomeEntryValidator = v.object({
  _id: v.id("incomeEntries"),
  _creationTime: v.number(),
  userId: v.string(),
  name: v.string(),
  amount: v.number(),
  note: v.optional(v.string()),
  budgetMonthId: v.optional(v.string()),
});

const budgetEntryValidator = v.object({
  _id: v.id("budgetEntries"),
  _creationTime: v.number(),
  userId: v.string(),
  name: v.string(),
  amount: v.number(),
  category: categoryValidator,
  quincena: quincenaValidator,
  note: v.optional(v.string()),
  budgetMonthId: v.optional(v.string()),
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

export const getData = query({
  args: {},
  returns: v.object({
    incomeEntries: v.array(incomeEntryValidator),
    budgetEntries: v.array(budgetEntryValidator),
  }),
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) return { incomeEntries: [], budgetEntries: [] };

    const userId = String(user._id);

    const incomeEntries = await ctx.db
      .query("incomeEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const budgetEntries = await ctx.db
      .query("budgetEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return { incomeEntries, budgetEntries };
  },
});

// ─── Income Mutations ────────────────────────────────────────────────────────

export const upsertIncomeEntry = mutation({
  args: {
    id: v.optional(v.id("incomeEntries")),
    name: v.string(),
    amount: v.number(),
    note: v.optional(v.string()),
  },
  returns: v.id("incomeEntries"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

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
    name: v.string(),
    amount: v.number(),
    category: categoryValidator,
    quincena: quincenaValidator,
    note: v.optional(v.string()),
  },
  returns: v.id("budgetEntries"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

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

// ─── One-time Migration ──────────────────────────────────────────────────────
// Run once via the Convex dashboard to strip the legacy `budgetMonthId` field
// from all existing documents. After running, remove the optional field from
// the schema and delete this function.

export const removeBudgetMonthIds = internalMutation({
  args: {},
  returns: v.object({ budgetEntries: v.number(), incomeEntries: v.number() }),
  handler: async (ctx) => {
    const budgetEntries = await ctx.db.query("budgetEntries").collect();
    let budgetCount = 0;
    for (const entry of budgetEntries) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("budgetMonthId" in (entry as any)) {
        const {
          _id,
          _creationTime,
          budgetMonthId: _removed,
          ...rest
        } = entry as typeof entry & { budgetMonthId?: string };
        await ctx.db.replace(_id, rest);
        budgetCount++;
      }
    }

    const incomeEntries = await ctx.db.query("incomeEntries").collect();
    let incomeCount = 0;
    for (const entry of incomeEntries) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ("budgetMonthId" in (entry as any)) {
        const {
          _id,
          _creationTime,
          budgetMonthId: _removed,
          ...rest
        } = entry as typeof entry & { budgetMonthId?: string };
        await ctx.db.replace(_id, rest);
        incomeCount++;
      }
    }

    return { budgetEntries: budgetCount, incomeEntries: incomeCount };
  },
});
