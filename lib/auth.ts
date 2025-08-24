import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        enum: [
          "USER",
          "ADMIN",
          "RELATIONSHIP_MANAGER",
          "CREDIT_ANALYST",
          "SUPERVISOR",
          "COMMITTE_MEMBER",
        ],
        required: false, // optional, if you want it mandatory
      },
    },
  },
});
