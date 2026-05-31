import { ConvexError, v } from "convex/values";

import { requireUser } from "./auth";
import { internalMutation, mutation, query } from "./_generated/server";

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
  order: v.optional(v.number()),
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
  order: v.optional(v.number()),
  paid: v.optional(v.boolean()),
  budgetMonthId: v.optional(v.string()),
});

// ─── Queries ─────────────────────────────────────────────────────────────────

export const getData = query({
  args: {},
  returns: v.object({
    incomeEntries: v.array(incomeEntryValidator),
    budgetEntries: v.array(budgetEntryValidator),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { incomeEntries: [], budgetEntries: [] };

    const userId = identity.subject;

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

// ─── Payment Tracking Mutations ──────────────────────────────────────────────

export const toggleExpensePaid = mutation({
  args: {
    id: v.id("budgetEntries"),
    paid: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const entry = await ctx.db.get("budgetEntries", args.id);
    if (!entry || entry.userId !== user.userId) {
      throw new ConvexError("Budget entry not found");
    }
    await ctx.db.patch("budgetEntries", args.id, { paid: args.paid });
    return null;
  },
});

export const resetQuincenaPayments = mutation({
  args: { quincena: quincenaValidator },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const entries = await ctx.db
      .query("budgetEntries")
      .withIndex("by_user", (q) => q.eq("userId", user.userId))
      .collect();
    for (const entry of entries) {
      if (entry.quincena === args.quincena && entry.paid) {
        await ctx.db.patch("budgetEntries", entry._id, { paid: false });
      }
    }
    return null;
  },
});

// ─── Reorder Mutations ───────────────────────────────────────────────────────

export const reorderBudgetEntries = mutation({
  args: { ids: v.array(v.id("budgetEntries")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    for (let i = 0; i < args.ids.length; i++) {
      const entry = await ctx.db.get("budgetEntries", args.ids[i]);
      if (entry && entry.userId === user.userId) {
        await ctx.db.patch("budgetEntries", args.ids[i], { order: i });
      }
    }
    return null;
  },
});

export const reorderIncomeEntries = mutation({
  args: { ids: v.array(v.id("incomeEntries")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    for (let i = 0; i < args.ids.length; i++) {
      const entry = await ctx.db.get("incomeEntries", args.ids[i]);
      if (entry && entry.userId === user.userId) {
        await ctx.db.patch("incomeEntries", args.ids[i], { order: i });
      }
    }
    return null;
  },
});

// ─── Import/Export ────────────────────────────────────────────────────────────

const incomeEntryImportValidator = v.object({
  name: v.string(),
  amount: v.number(),
  note: v.optional(v.string()),
});

const budgetEntryImportValidator = v.object({
  name: v.string(),
  amount: v.number(),
  category: categoryValidator,
  quincena: quincenaValidator,
  note: v.optional(v.string()),
  paid: v.optional(v.boolean()),
});

export const importData = mutation({
  args: {
    mode: v.union(v.literal("merge"), v.literal("replace")),
    incomeEntries: v.array(incomeEntryImportValidator),
    budgetEntries: v.array(budgetEntryImportValidator),
  },
  returns: v.object({
    incomeCount: v.number(),
    budgetCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.mode === "replace") {
      const existingIncome = await ctx.db
        .query("incomeEntries")
        .withIndex("by_user", (q) => q.eq("userId", user.userId))
        .collect();
      for (const entry of existingIncome) {
        await ctx.db.delete("incomeEntries", entry._id);
      }

      const existingBudget = await ctx.db
        .query("budgetEntries")
        .withIndex("by_user", (q) => q.eq("userId", user.userId))
        .collect();
      for (const entry of existingBudget) {
        await ctx.db.delete("budgetEntries", entry._id);
      }
    }

    let incomeCount = 0;
    for (const entry of args.incomeEntries) {
      await ctx.db.insert("incomeEntries", {
        userId: user.userId,
        name: entry.name,
        amount: entry.amount,
        note: entry.note,
      });
      incomeCount++;
    }

    let budgetCount = 0;
    for (const entry of args.budgetEntries) {
      await ctx.db.insert("budgetEntries", {
        userId: user.userId,
        name: entry.name,
        amount: entry.amount,
        category: entry.category,
        quincena: entry.quincena,
        note: entry.note,
        paid: entry.paid,
      });
      budgetCount++;
    }

    return { incomeCount, budgetCount };
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
