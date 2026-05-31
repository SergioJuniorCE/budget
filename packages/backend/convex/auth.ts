import type { GenericMutationCtx, GenericQueryCtx } from "convex/server";

import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";

export async function requireUser(ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return {
    userId: identity.subject,
    name: identity.name ?? identity.email,
    email: identity.email,
    emailVerified: identity.emailVerified,
  };
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return {
      _id: identity.subject,
      name: identity.name ?? identity.email,
      email: identity.email,
    };
  },
});
