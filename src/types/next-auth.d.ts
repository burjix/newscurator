import { UserRole, SubscriptionTier } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      subscriptionTier: SubscriptionTier;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    subscriptionTier: SubscriptionTier;
  }
}