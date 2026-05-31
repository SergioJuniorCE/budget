import { describe, it, expect } from "vitest";
import { v } from "convex/values";

describe("Convex Validators Structure", () => {
  describe("quincena validator", () => {
    const quincenaValidator = v.union(v.literal("1ra"), v.literal("2da"));

    it("is a union validator", () => {
      expect(quincenaValidator.kind).toBe("union");
    });

    it("has two literal members", () => {
      expect(quincenaValidator.members).toHaveLength(2);
      expect(quincenaValidator.members[0].value).toBe("1ra");
      expect(quincenaValidator.members[1].value).toBe("2da");
    });
  });

  describe("category validator", () => {
    const categoryValidator = v.union(v.literal("needs"), v.literal("wants"), v.literal("savings"));

    it("is a union validator", () => {
      expect(categoryValidator.kind).toBe("union");
    });

    it("has three literal members", () => {
      expect(categoryValidator.members).toHaveLength(3);
      expect(categoryValidator.members[0].value).toBe("needs");
      expect(categoryValidator.members[1].value).toBe("wants");
      expect(categoryValidator.members[2].value).toBe("savings");
    });
  });

  describe("income entry validator", () => {
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

    it("is an object validator", () => {
      expect(incomeEntryValidator.kind).toBe("object");
    });

    it("has required fields", () => {
      const fields = incomeEntryValidator.fields;
      expect(fields._id.kind).toBe("id");
      expect(fields._creationTime.kind).toBe("float64");
      expect(fields.userId.kind).toBe("string");
      expect(fields.name.kind).toBe("string");
      expect(fields.amount.kind).toBe("float64");
    });

    it("has optional fields", () => {
      const fields = incomeEntryValidator.fields;
      // Optional fields unwrap to their inner type
      expect(fields.note.kind).toBe("string");
      expect(fields.order.kind).toBe("float64");
      expect(fields.budgetMonthId.kind).toBe("string");
    });
  });

  describe("budget entry validator", () => {
    const categoryValidator = v.union(v.literal("needs"), v.literal("wants"), v.literal("savings"));
    const quincenaValidator = v.union(v.literal("1ra"), v.literal("2da"));

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

    it("is an object validator", () => {
      expect(budgetEntryValidator.kind).toBe("object");
    });

    it("has category field with union validator", () => {
      expect(budgetEntryValidator.fields.category.kind).toBe("union");
    });

    it("has quincena field with union validator", () => {
      expect(budgetEntryValidator.fields.quincena.kind).toBe("union");
    });

    it("has paid as boolean field", () => {
      // Optional fields unwrap to their inner type
      expect(budgetEntryValidator.fields.paid.kind).toBe("boolean");
    });
  });
});
